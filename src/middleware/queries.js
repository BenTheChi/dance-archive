const Series = require('../models/series')
const Competition = require('../models/competition')
const User = require('../models/user')
const mongoose = require('mongoose')
const convert = require('../tools/convert')
const validate = require('../tools/validate')

const queries = (req, res, next) => {
    const path = req.route.path

    if(req.query.sortBy){
        sortQuery = req.query.sortBy.split(':')
        if(sortQuery[1] == 'desc'){
            sortQuery[0] = '-' + sortQuery[0]
        }
        req.sort = sortQuery[0]
    }
    if(req.query.limit && req.isAdmin){
        req.limit = parseInt(req.query.limit)
    } else{
        req.limit = 5
    }
    if(req.query.skip){
        req.skip = req.query.skip - (req.query.skip % 5)
    }


    if(path == "/users"){
        req.query = pathUsers(req.query)
        return next()
    }
    else if(path == "/competitions"){
        req.query = pathCompetitions(req.query)
        .then((queries) => {
            req.query = queries
            return next()
        })
    }
    else if(path == "/series"){
        req.query = pathSeries(req.query)
        return next()
    }
    else if(path == "/search"){
        req.query = pathSearch(req.query)
        return next()
    }
}

function pathUsers(queries){
    const queryKeys = Object.keys(queries)
    const allowedQueries = ['firstName', 'lastName', 'userName', 'email', 'age', 'admin']

    queryKeys.forEach((key) => {
        //invalid queries and sortBy gets deleted
        if(!allowedQueries.includes(key)){
            delete queries[key]
        }
    })

    return queries
}

const pathCompetitions = async (queries) => {
    const queryKeys = Object.keys(queries)
    const allowedQueries = ['name', 'startDate', 'endDate', 'city', 'dj', 'mc', 'series']

    for(let key of queryKeys){
        if(!allowedQueries.includes(key)){
            delete queries[key]
        }

        if(key.includes("Date")){
            if(validate.dateValidator(queries[key])){
                let convertedDate = queries[key].replace(/\_/g,"-")
                queries.date = {}

                if(key == 'startDate'){
                    queries.date.$gte = convertedDate
                    delete queries.startDate
                }
                else if(key == 'endDate'){
                    queries.date.$lte = convertedDate
                    delete queries.endDate
                }
            }
            else{
                delete queries[key]
                return queries
            }
        }

        if(key == "series"){
            let id = await convert.convertToId(key, queries[key].replace(/-/g, " "))
            queries.series = id
        }
    }

    return queries
}

function pathSeries(queries){
    const queryKeys = Object.keys(queries)
    const allowedQueries = ['name', 'startDate', 'endDate', 'cityFounded']

    queryKeys.forEach((key) => {
        if(!allowedQueries.includes(key)){
            delete queries[key]
        }

        else if(key.includes("Date")){
            if(validate.dateValidator(queries[key])){
                let convertedDate = queries[key].replace(/\_/g,"-")
                queries.date = {}

                if(key == 'startDate'){
                    queries.dateFounded.$gte = convertedDate
                    delete queries.startDate
                }
                else if(key == 'endDate'){
                    queries.dateFounded.$lte = convertedDate
                    delete queries.endDate
                }
            }
            else{
                delete queries[key]
                return queries
            }
        }
    })

    return queries
}

function pathSearch(queries){
    //TODO Main and Submenu

    return queries
}

module.exports = queries