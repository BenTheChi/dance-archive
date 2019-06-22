const express = require('express')
const router = new express.Router()
const Category = require('../models/category')
const auth = require('../middleware/auth')
const validUpdates = require('../middleware/validUpdates')

//Create a new category under a specific competition
router.post('/competitions/:city/:compName', auth, async (req, res) => {
    const compName = req.params.compName.replace(/-/g, " ")
    const city = req.params.city
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
        if(category){
            return res.status(400).send("Category format and style already exists")
        }

        req.body.addedBy = user._id
        req.body.competition = competition._id

        category = new Category(req.body)
        await category.save().catch((error) => { return res.status(400).send(error)})

        if(req.isAdmin){
            return res.status(201).send(category)
        }
        else{
            delete req.body.addedBy
            delete req.body.competition
            return res.status(201).send(req.body)
        }
    }
    catch(error){
        //Add better error handling with the getObjectValue script
        res.status(400).send(error)
    }
})

router.get('/competitions/:city/:compName/:catName', auth, async (req, res) => {
    const compName = req.params.compName.replace(/-/g, " ")
    const city = req.params.city
    const styleFormat = req.params.catName.split("-")
    const style = styleFormat[0]
    const format = styleFormat[1]
    const fields = req.isAdmin ? '' : 'style format competition totalBracketLayers hasPrelims'

    try {
        let competition = await Competition.findOne({ compName, city }, '_id')

        if(!competition){
            return res.status(404).send()
        }

        let category = await Category.findOne({ style, format, "competition": competition._id }, fields)
        if(!category){
            return res.status(404).send()
        }
        else{
            await category.populate({
                path: 'battles'
            }).execPopulate()
            
            category.battleArray = category.battles
            return res.status(200).send(category)
        }
    } catch(error) {
        console.log(error)
        res.status(400).send()
    }
})

router.patch('/competitions/:city/:compName/:catName', auth, validUpdates, async (req, res) => {
    const user = req.user
    const compName = req.params.compName.replace(/-/g, " ")
    const city = req.params.city
    const styleFormat = req.params.catName.split("-")
    const style = styleFormat[0]
    const format = styleFormat[1]
    
    if(!user){
        res.status(401).send()
    }

    try {
        let competition = await Competition.findOne({ compName, city }, fields)
        if(!competition){
            return res.status(404).send()
        }

        let category = await Category.findOne({ style, format, "competition": competition._id }, fields)
        if(!category){
            return res.status(404).send()
        }

        if(!req.isAdmin){
            if(category.addedBy.toString() != user._id.toString()){
                return res.status(403).send()
            }
        }

        req.updates.forEach((update) => category[update] = req.body[update])
        await category.save().catch((error) => { return res.status(400).send(error)})
    } catch(error) {
        console.log(errors)
        res.status(400).send()
    }
})
 
//TODO delete all battles
router.delete('/competitions/:city/:compName/:catName', async (req, res) => {
    const compName = req.params.compName.replace(/-/g, " ")
    const city = req.params.city
    try {
        let competition = await Competition.findOne({ compName, city }, fields)

        if(!competition){
            return res.status(404).send()
        }

    } catch(error) {
        console.log(errors)
        res.status(400).send()
    }
})


module.exports = router