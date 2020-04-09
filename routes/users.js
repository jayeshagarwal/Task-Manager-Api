const express = require('express')
const user = require('../models/user')
const auth = require('../middlewares/auth')
const multer = require('multer')
const sharp = require('sharp')
const router = express.Router()

router.post('/', async (req,res)=> {
    try {
        const User = new user(req.body)
        await User.save()
        const token = await User.generateToken() 
        res.status(201).send({User, token})
    }
    catch(e) {
        res.status(400).send(e)
    }
    // replace Jayesh   Agarwal with Jayesh Agarwal
})

router.get('/login', async(req,res)=> {
    try {
        const User = await user.findByCredentials(req.body.email, req.body.password)
        const token = await User.generateToken()
        res.send({User, token})
    }
    catch(e) {
        res.status(400).send(e.message)
    }
})

router.get('/me', auth, async (req,res)=> {
    res.send(req.user)
})

router.post('/logout', auth, async (req,res)=> {
    try {
        req.user.tokens = req.user.tokens.filter((token)=> {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }
    catch (e)
    {
        res.status(500).send(e)
    }
})

router.post('/logout/all', auth, async (req,res)=> {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch (e)
    {
        res.status(500).send(e)
    }
})

router.patch('/me', auth, async (req,res)=> {
    try {
        for(var key in req.body)
        {
            req.user[key] = req.body[key]
        }
        await req.user.save()
        res.send(req.user)
    }
    catch (e)
    {
        res.status(400).send(e)
    }
})

router.delete('/me', auth, async (req,res)=> {
    try {
        await req.user.remove()
        res.send(req.user)
    }
    catch(e) {
        res.status(500).send(e)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('/me/avatar', auth, upload.single('avatar'), async (req,res)=> {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error,req,res,next)=> {
    res.status(400).send({error: error.message})
})

router.delete('/me/avatar', auth, async (req,res)=> {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/me/avatar', auth, (req,res)=> {
    try {
        if(!req.user.avatar)
        {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(req.user.avatar);
    }
    catch(e) {
        res.status(404).send()
    }
})

module.exports = router;