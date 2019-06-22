const Series = require('../models/series')
const Competition = require('../models/competition')
const User = require('../models/user')
const mongoose = require('mongoose')

const convertToId = async (key, value) => {
    const NO_ID = "000000000000000000000000"
    var id = new mongoose.Types.ObjectId(NO_ID)

    if(key == "competition"){
        let competition = await Competition.findOne({ "name": value }, '_id')

        if(competition){
            return competition._id
        }
    }
    else if(key == "series"){
        let series = await Series.findOne({ "name": value }, '_id')

        if(series){
            return series._id
        }
    }
    else if(key == "userName"){
        let user = await User.findOne({ "userName": value }, '_id')

        if(user){
            return user._id
        }
    }
    else if(key == "email"){
        let user = await User.findOne({ "email": value }, '_id')

        if(user){
            return user._id
        }
    }

    return id
}


module.exports.convertToId = convertToId