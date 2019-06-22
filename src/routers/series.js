const express = require('express')
const router = new express.Router()
const Series = require('../models/series')
const Competition = require('../models/competition')
const auth = require('../middleware/auth')
const queries = require('../middleware/queries')
const validUpdates = require('../middleware/validUpdates')

router.post('/series', auth, validUpdates, async (req, res) => {
    const user = req.user
    var series = new Series(req.body)

    if(!user){
        return res.status(401).send()
    }

    try {
        series.addedBy = user._id
        await series.save().catch((error) => {return res.status(400).send(user)})

        if(req.isAdmin){
            return res.status(201).send(series)
        }
    
        else{
            delete req.body.addedBy
            return res.status(201).send(req.body)
        }
    }
    catch(error){
        //TODO Add better error handling with the getObjectValue script
        return res.status(400).send(error)
    }
})

router.get('/series', auth, queries, async (req, res) => {
    const fields = req.isAdmin ? '' : 'name organizer cityFounded dateFounded mostRecentCompetition'

    try {
        let series = await Series.find(req.query, fields)

        if(!series){
            return res.status(404).send()
        }
        else{
            return res.status(200).send(series)
        }
    } catch (error) {
        console.log(error)
        res.status(400).send()
    }
})

router.get('/series/:name', auth, async (req, res) => {
    const name = req.params.name.replace(/-/g, " ")
    const fields = req.isAdmin ? '' : 'name organizer cityFounded dateFounded mostRecentCompetition'

    try {
        let series = await Series.findOne({ name }, fields)

        if(!series){
            return res.status(404).send()
        }
        else{
            await series.populate({
                path: 'competitions'
            }).execPopulate()
            
            series.competitionArray = series.competitions
            return res.status(200).send(series)
        }
    } catch (error) {
        console.log(error)
        res.status(400).send()
    }
})

router.patch('/series/:name', auth, validUpdates, async (req, res) => {
    const user = req.user
    const name = req.params.name.replace(/-/g, " ")

    if(!user){
        res.status(401).send()
    }

    try {
        const series = await Series.findOne({ name })

        if(!series){
            return res.status(404).send()
        }

        if(!req.isAdmin){
            if(series.addedBy.toString() != user._id.toString()){
                return res.status(403).send()
            }
        }

        req.updates.forEach((update) => series[update] = req.body[update])
        await series.save().catch((error) => { return res.status(400).send(error)})
        
        if(!req.isAdmin){
            series.addedBy = undefined
        }
        res.send(series)
    } catch(errors) {
        res.status(400).send()
    }
})

router.delete('/series/:name', auth, async (req, res) => {
    const user = req.user 
    const name = req.params.name.replace(/-/g, " ")

    if(!user){
        return res.status(401).send()
    }

    try {
        const series = await Series.findOneAndDelete({ name })
        if(!series){
            return res.status(404).send("Cannot find this series to delete")
        }
        
        const seriesId = series._id


        if(!req.isAdmin){
            if(series.addedBy.toString() != user._id.toString()){
                return res.status(403).send()
            }
        }

        const competitions = await Competition.find({ _id: seriesId })
        for(let competition of competitions){
            let changedCompetition = await Competition.findById(competition._id)
            delete changedCompetition.series
            changedCompetition.save()
        }

        res.send(series)
    } catch(error) {
        console.log(error)
        res.status(400).send()
    }
})

module.exports = router