const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const validUpdates = require('../middleware/validUpdates')
const queries = require('../middleware/queries')
const convert = require('../tools/convert')

router.post('/users', async (req, res) => {
    const userName = req.body.userName
    const email = req.body.email
    let user

    if(email){
        user = await User.findOne({ email })
    }
    else if(userName){
        user = await User.findOne({ userName })
    }
    if(user){
        return res.status(409).send("Username or Email aleady exists")
    }

    user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        
        return res.status(201).send({user, token})

    } catch(error) {
        res.status(400).send(error)
    }
})
 
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.userName, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user: user.getPublicProfile(), token})
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    const user = req.user
    if(!user){
        return res.status(401).send({ error: 'Please authenticate.' })
    }

    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save().catch((error) => { return res.status(400).send(error)})

        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    const user = req.user
    if(!user){
        return res.status(401).send({ error: 'Please authenticate.' })
    }

    try {
        req.user.tokens = []
        await req.user.save().catch((error) => { return res.status(400).send(error)})

        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    const user = req.user
    if(!user){
        return res.status(401).send({ error: 'Please authenticate.' })
    }

    await res.send(req.user)
})

router.get('/users', auth, queries, async (req, res) => {
    if(!req.isAdmin){
        return res.status(403).send()
    }

    try {
        const users = await User.find(req.query).limit(req.limit).skip(req.skip).sort(req.sort)
        res.status(200).send(users)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/users/me', auth, validUpdates, async (req, res) => {
    try {
        req.updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save().catch((error) => { return res.status(400).send(error)})

        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    if(!req.user){
        return res.status(401).send()
    }

    try {
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})

module.exports = router