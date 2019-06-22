const mongoose = require('mongoose')
const Competition = require('../models/competition')
const validator = require('validator')

const seriesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    organizer: {
        type: String,
        trim: true
    },
    cityFounded:{
        type: String,
        required: true
    },
    dateFounded: {
        type: Date
    },
    mostRecentCompetition: {
        type: Date
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    competitionArray: [Object]
})

seriesSchema.virtual('competitions', {
    ref: 'Competition',
    localField: '_id',
    foreignField: 'series'
})

const Series = mongoose.model('Series', seriesSchema)

module.exports = Series
