const express = require('express')
const router = new express.Router()
const queries = require('../middleware/queries')
const Series = require('../models/series')
const Competition = require('../models/competition')
const Category = require('../models/category')
const Battle = require('../models/battle')
const User = require('../models/user')

router.get('/search', async (req, res) => {
    try{

    } catch(error){
        console.log(error)
        res.status(400).send(error)
    }
})

module.exports = router