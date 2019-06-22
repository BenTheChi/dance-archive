const express = require('express')
const router = new express.Router()
const Competition = require('../models/competition')
const auth = require('../middleware/auth')
const validUpdates = require('../middleware/validUpdates')
const queries = require('../middleware/queries')
const convert = require('../tools/convert')
const validate = require('../tools/validate')

//Create new competitions
router.post('/competitions', auth, validUpdates, async (req, res) => {
    const user = req.user

    if(!user){
        return res.status(401).send()
    }

    try {
        req.body.addedBy = user._id

        competition = new Competition(req.body)
        await competition.save().catch((error) => { return res.status(400).send(error)})

        if(req.isAdmin){
            return res.status(201).send(competition)
        }
    
        else{
            delete req.body.addedBy
            return res.status(201).send(req.body)
        }
    }
    catch(error){
        //Add better error handling with the getObjectValue script
        return res.status(400).send(error)
    }
})

router.get('/competitions', auth, queries, async (req, res) => {
    const fields = req.isAdmin ? '' : 'name date city dj mc series'

    try {
        let competitions = await Competition.find(req.query, fields).limit(req.limit).skip(req.skip).sort(req.sort)

        if(!competitions){
            return res.status(404).send()
        }
        else{
            return res.status(200).send(competitions)
        }
    } catch (error) {
        console.log(error)
        res.status(400).send()
    }
})

router.get('/competitions/:city/:name', auth, async (req, res) => {
    const name = req.params.name.replace(/-/g, " ")
    const city = req.params.city
    const fields = req.isAdmin ? '' : 'name date city dj mc series'

    try {
        let competition = await Competition.findOne({ name, city }, fields)

        if(!competition){
            return res.status(404).send()
        }
        else{
            await competition.populate({
                path: 'categories'
            }).execPopulate()
            
            competition.categoryArray = competition.categories
            return res.status(200).send(competition)
        }
    } catch (error) {
        console.log(error)
        res.status(400).send()
    }
})

router.patch('/competitions/:city/:name', auth, validUpdates, async (req, res) => {
    const user = req.user
    const name = req.params.name.replace(/-/g, " ")
    const city = req.params.city

    if(!user){
        res.status(401).send()
    }

    try {
        const competition = await Competition.findOne({ name, city })
    
        if(!competition){
            return res.status(404).send()
        }
        
        if(!req.isAdmin){
            if(competition.addedBy.toString() != user._id.toString()){
                return res.status(403).send()
            }
        }
        
        req.updates.forEach((update) => competition[update] = req.body[update])

        await competition.save().catch((error) => { return res.status(400).send(error)})

        res.send(competition)
    } catch(errors) {
        console.log(errors)
        res.status(400).send()
    }
})

router.delete('/competitions/:city/:name', auth, async (req, res) => {
    const user = req.user 
    const name = req.params.name.replace(/-/g, " ")
    const city = req.params.city

    if(!user){
        return res.status(401).send()
    }

    try {
        const competition = await Competition.findOneAndDelete({ name, city })

        if(!competition){
            return res.status(404).send("Cannot find this competition to delete")
        }
        
        if(!req.isAdmin != user._id){
            if(competition.addedBy.toString() != user._id.toString()){
                return res.status(403).send()
            }
        }

        res.send(competition)
    } catch(error) {
        console.log(error)
        
        res.status(400).send()
    }
})

module.exports = router