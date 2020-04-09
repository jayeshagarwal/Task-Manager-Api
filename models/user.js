const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value))
                throw new Error("Email is Invalid")
        }
    },
    age: {
        type: Number,
        validate(value) {
            if(value<0)
                throw new Error("Age must be positive")
        },
        default: 0
    },
    password: {
        type: String,
        trim: true, 
        required: true,
        minlength: 7,
        validate(value) {
            if(value.toLowerCase().includes('password'))
                throw new Error("Password can't contain password")
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},
{
    timestamps: true
});

userSchema.pre('save', async function (next) {
    const user = this;
    if(user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
});

userSchema.pre('remove', async function (next) {
    const user = this;
    await task.deleteMany({owner: user._id})
    next()
})

userSchema.statics.findByCredentials = async (email, password) => {
    const User = await user.findOne({email})
    if(!User)
    {
        throw new Error('Unable to Login!') 
    }
    const isMatch = await bcrypt.compare(password, User.password)
    if(!isMatch)
    {
        throw new Error('Unable to login!')
    }
    return User
}

userSchema.methods.generateToken = async function() {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_KEY)
    user.tokens.push({token})
    await user.save()
    return token
}

userSchema.methods.toJSON = function() {
    const user = this
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar
    return userObj
}

user = mongoose.model('User', userSchema);
module.exports = user;