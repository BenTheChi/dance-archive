const express = require('express')
const router = new express.Router()
const Battle = require('../models/battle')
const Category = require('../models/category')
const Competition = require('../models/competition')
const auth = require('../middleware/auth')
const validUpdates = require('../middleware/validUpdates')
const convert = require('../tools/convert')
const validate = require('../tools/validate')

router.post('/competitions/:city/:compName/:catName', auth, async (req, res) => {
    const compName = req.params.compName.replace(/-/g, " ")
    const city = req.params.city
    const styleFormat = req.params.catName.split("-")
    const style = styleFormat[0]
    const format = styleFormat[1]

    const user = req.user

    if(!user){
        return res.status(401).send()
    }

    try {
        let competition = await Competition.findOne({ compName, city }, '_id')
        if(!competition){
            return res.status(404).send("Competition name or city does not exist")
        }

        let category = await Category.findOne({ style, format, "competition": competition._id })
        if(!category){
            return res.status(404).send("Category format or style does not exist")
        }

        let battle = await Battle.findOne({ "url": req.body.url, "category": category._id })
        if(battle){
            return res.status(400).send("Battle with same url in same category already exists")
        }

        if(req.body.bracketNumber > category.totalBracketLayers){
            return res.status(400).send("Battle bracket is too large for category")
        }

        req.body.addedBy = user._id
        req.body.competition = competition._id
        req.body.category = category._id

        battle = new Battle(req.body)
        await battle.save().catch((error) => { return res.status(400).send(error)})

        if(req.isAdmin){
            return res.status(201).send(battle)
        }
        else{
            delete req.body.addedBy
            delete req.body.competition
            delete req.body.category
            return res.status(201).send(req.body)
        }
    } catch(error) {
        res.status(400).send(error)
    }
})

router.get('/competitions/:city/:compName/:catName/:bracket/:id', auth,  async (req, res) => {
    const compName = req.params.compName.replace(/-/g, " ")
    const city = req.params.city
    const styleFormat = req.params.catName.split("-")
    const style = styleFormat[0]
    const format = styleFormat[1]
    const bracket = req.params.bracket
    const id = req.params.id
    const fields = req.isAdmin ? '' : 'date url dancers winner bracketNumber'

    try {
        let competition = await Competition.findOne({ compName, city }, '_id')
        if(!competition){
            return res.status(404).send("Competition name or city does not exist")
        }

        let category = await Category.findOne({ style, format, "competition":competition._id })
        if(!category){
            return res.status(404).send("Category format or style does not exist")
        }

        let battle = await Battle.findOne({ "_id":id, "category":category._id, "competition":competition._id, "bracketNumber":bracket }, fields)
        if(!battle){
            return res.status(400).send("Battle does not exist")
        }

        res.status(200).send(battle)
    } catch(error) {
        console.log(error)
        res.status(400).send()
    }
})

router.patch('/competitions/:city/:compName/:catName/:bracket/:id', auth, validUpdates, async (req, res) => {
    const compName = req.params.compName.replace(/-/g, " ")
    const city = req.params.city
    const styleFormat = req.params.catName.split("-")
    const style = styleFormat[0]
    const format = styleFormat[1]
    const bracket = req.params.bracket
    const id = req.params.id

    try {
        let competition = await Competition.findOne({ compName, city }, '_id')
        if(!competition){
            return res.status(404).send("Competition name or city does not exist")
        }

        let category = await Category.findOne({ style, format, "competition":competition._id })
        if(!category){
            return res.status(404).send("Category format or style does not exist")
        }

        let battle = await Battle.findOne({ "_id":id, "category":category._id, "competition":competition._id, "bracketNumber":bracket }, fields)
        if(!battle){
            return res.status(400).send("Battle does not exist")
        }

        if(!req.isAdmin){
            if(battle.addedBy.toString() != user._id.toString()){
                return res.status(403).send()
            }
        }

        if(updates.includes("bracketNumber")){
            if(category.totalBracketLayers){
                return res.status(400).send("Bracket number higher than category brackets")
            }
        }

        req.updates.forEach((update) => battle[update] = req.body[update])
        await battle.save().catch((error) => { return res.status(400).send(error)})
    } catch(error) {
        console.log(error)
        res.status(400).send()
    }
})

router.delete('/competitions/:city/:compName/:catName/:bracket/:id', async (req, res) => {
    try {

    } catch(error) {
        console.log(error)
        res.status(400).send()
    }
})

module.exports = router