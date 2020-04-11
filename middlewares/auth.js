const jwt = require('jsonwebtoken')
const user = require('../models/user')

// Authentication middleware to authenticate user
const auth = async (req,res,next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_KEY)
        const User = await user.findOne({_id: decoded._id, 'tokens.token': token})
        if(!User)
        {
            throw new Error()
        }
        req.user = User
        req.token = token
        next();
    }
    catch(e)
    {
        res.status(401).send({error: 'Please Authenticate'})
    }
}

module.exports = auth