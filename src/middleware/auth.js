const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async(req, res, next) => {

    try {
        if(!('authorization' in req.headers)){
            req.user = undefined
            req.isAdmin = false
            return next()
        }

        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'nope')
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token})
        req.user = user

        if(req.user.admin){
            req.isAdmin = true
        }
        else{
            req.isAdmin = false
        }

        req.token = token
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth