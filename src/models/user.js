const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: true,
        trim: true
    },
    lastName:{
        type: String,
        required: true,
        trim: true
    },
    userName:{
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(value.includes(" ")){
                throw new Error('Username cannot contain spaces.')
            }
        }
    },
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        validate(value){
            if (value < 0){
                throw new Error('Age must be positive number')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        validate(value){
            if(String(value).length < 6){
                throw new Error('Password too short')
            }

            else if (String(value).includes('password')){
                throw new Error('You cant have the word password in your password.  Dumb ass.')
            }
        }
    },
    admin:{
        type: Boolean,
        required: true,
        default: false
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
})

userSchema.methods.getPublicProfile = function(){
    const userObject = this.toObject()

    delete userObject.password
    delete userObject.tokens
    return userObject
}

userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id: this._id.toString()}, 'nope')
    this.tokens = this.tokens.concat({ token })
    await this.save()

    return token
}

userSchema.statics.findByCredentials = async (email, userName, password) => {
    var user

    if(userName){
        user = await User.findOne({ userName })
    }

    else if(email){
        user = await User.findOne({ email })
    }
    
    
    if(!user){
        throw new Error('User does not exist')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('Wrong password')
    }

    return user
}
 
//Hash the plain text password before saving
userSchema.pre('save', async function (next) {     
    const user = this 
 
    if (user.isModified('password')) {         
        user.password = await bcrypt.hash(user.password, 8)
        } 
 
    next()
}) 

//Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
    await User.deleteMany({owner: this._id.toString()})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User