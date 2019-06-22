const Series = require('../models/series')
const Competition = require('../models/competition')
const Category = require('../models/category')
const Battle = require('../models/battle')
const User = require('../models/user')
const validate = require('../tools/validate')
const convert = require('../tools/convert')


const validUpdates = async (req, res, next) => {
    const path = req.route.path
    const updates = Object.keys(req.body)
    var allowedUpdates = []

    //TODO TODO TODO
    if(!req.user){
        return res.status(401).send()
    }

    if(path == "/users/me"){
        allowedUpdates = ['firstName', 'lastName', 'email', 'password', 'age']
        
        if(updates.includes("email")){
            let user = await User.findOne({ "email":req.body.email })

            if(user){
                return res.status(400).send({ error: 'Email already exists'})
            }
        }
    }


    else if(path == "/series/:name" || path == "/series"){
        allowedUpdates = ['name', 'organizer', 'cityFounded', 'dateFounded']

        if(updates.includes("name")){
            let series = await Series.findOne({ "name":req.body.name })

            if(series){
                return res.status(400).send({ error: 'Series name already exists'})
            }
        }

        if(updates.includes("dateFounded")){
            if(!validate.dateValidator(req.body.dateFounded)){
                return res.status(400).send("Invalid date format")
            }
        }
    }


    else if(path == "/competitions"){
        allowedUpdates = ['name', 'date', 'city', 'dj', 'mc', 'series']
        
        if(updates.includes("series")){
            let series = await convert.convertToId("series", req.body.series)

            if(series == "000000000000000000000000"){
                return res.status(400).send("Series name not found")
            }

            req.body.series = series
        }

        let competition = await Competition.findOne({"name": req.body.name, "city": req.body.city})
        if(competition){
            return res.status(409).send("Competition by the same name in same city aleady exists")
        }

        if(!validate.dateValidator(req.body.date)){
            return res.status(400).send("Invalid date format")
        }
    }


    else if(path == "/competitions/:city/:name"){
        allowedUpdates = ['name', 'date', 'city', 'dj', 'mc', 'series']
        let name = req.params.name.replace(/-/g, " ")
        let city = req.params.city

        if(updates.includes("name") || updates.includes("city")){
            if(updates.includes("name")){
                name = req.body.name
            }
            if(updates.includes("city")){
                city = req.body.city
            }

            let competition = await Competition.findOne({ name, city })
        
            if(competition){
                return res.status(400).send("Competition with same name and city already exists")
            }
        }

        if(updates.includes("series")){
            let series = await convert.convertToId("series", req.body.series)
            if(series == "000000000000000000000000"){
                return res.status(400).send("Series name not found")
            }

            req.body.series = series
        }

        if(updates.includes("date")){
            if(!validate.dateValidator(req.body.date)){
                return res.status(400).send("Invalid date format")
            }
        }
    }


    else if(path == "/competitions/:city/:compName/:catName"){
        allowedUpdates = ['style', 'format', 'totalBracketLayers', 'hasPrelims']

        if(updates.includes("style") || updates.includes("format")){
            const styleFormat = req.params.catName.split("-")
            let style = styleFormat[0]
            let format = styleFormat[1]

            if(updates.includes("style")){
                style = req.body.style
            }
            if(updates.includes("format")){
                format = req.body.format
            }

            let category = await Category.findOne({ style, format })
        
            if(category){
                return res.status(400).send("Category with same style and format already exists")
            }
        }
    }


    else if(path == "/competitions/:city/:compName/:catName/:bracket/:id"){
        allowedUpdates = ['date', 'url', 'dancers', 'winner', 'bracketNumber']

        if(updates.includes("url")){
            let battleUrl = await Battle.findOne({ "url": req.body.url }, 'url')
            if(battleUrl){
                return res.status(400).send("Battle with same url in same category already exists")
            }
        }

        if(updates.includes("date")){
            if(!validate.dateValidator(req.body.date)){
                return res.status(400).send("Invalid date format")
            }
        }
    }

    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    
    if(!isValidUpdate){
        return res.status(400).send({ error: 'Invalid updates!'})
    }
    else{
        req.updates = updates
    }

    next()
}

module.exports = validUpdates