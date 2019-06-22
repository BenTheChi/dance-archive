const mongoose = require('mongoose')
const validator = require('validator')

const battleSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Category'
    },
    competition: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Competition'
    },
    date: {
        type: Date,
        required: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    url: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isURL(value)){
                throw new Error('URL is invalid')
            }
        }
    },
    dancers: [String],
    winner: {
        type: String
    },
    bracketNumber: {
        type: Number,
        required: true,
        validate(value){
            //TODO bracket number cannot be bigger than category bracket layer - 1
        }
    }
})

const Battle = mongoose.model('Battle', battleSchema)

module.exports = Battle