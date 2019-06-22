const mongoose = require('mongoose')
const validator = require('validator')

const competitionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(value.includes("-")){
                throw new Error('Event name cannot contain dashes.')
            }
        }
    },
    date: {
        type: Date,
        required: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    dj: {
        type: String,
        trim: true
    },
    mc: {
        type: String,
        trim: true
    },
    series: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Series'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    categoryArray: [Object]
})

competitionSchema.virtual('categories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'competition'
})

const Competition = mongoose.model('Competition', competitionSchema)

module.exports = Competition