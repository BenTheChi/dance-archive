const mongoose = require('mongoose')
const validator = require('validator')

const categorySchema = new mongoose.Schema({
    style: {
        type: String,
        required: true,
        trim: true,
        validate(value){
            const allowedValues = ['Popping', 'Breaking', 'Locking', 'Hip Hop', 'Waacking', 'Krumping', 'All Style', 'Other']

            if(allowedValues.includes(value)){
                throw new Error(value + ' is not a valid style')
            }
        }
    },
    format: {
        type: String,
        required: true,
        trim: true,
        validate(value){
            const allowedValues = ['1v1', '2v2', '3v3', '4v4', '5v5', '7toSmoke']

            if(allowedValues.includes(value)){
                throw new Error(value + ' is not a valid format')
            }
        }
    },
    competition: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Competition'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    totalBracketLayers: {
        type: Number,
        required: true,
        default: 1 //This will be the number for finals
    },
    hasPrelims: {
        type: Boolean,
        required: true,
        default: true //If true 0 will be the number for prelims
    },
    battleArray: [Object]
})

categorySchema.virtual('battles', {
    ref: 'Battle',
    localField: '_id',
    foreignField: 'category'
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category