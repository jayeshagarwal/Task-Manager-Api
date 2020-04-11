const express = require('express')
const task = require('../models/task')
const auth = require("../middlewares/auth") 
const router = express.Router()

// creating new task for loggedin user
router.post('/', auth, async (req,res)=> {
    try {
        req.body.owner = req.user._id
        const Task = await task.create(req.body)
        res.status(201).send(Task)
    }
    catch(e) {
        res.status(400).send(e)
    }
})

// getting all tasks of logged in user
router.get('/', auth, async (req,res)=> {
    try {
        pagination = {
            skip: parseInt(req.query.skip) || 0,
            limit: parseInt(req.query.limit) || 3 
        }
        if(req.query.sortBy)
        {
            // sorting result by time when they created
            const parts = req.query.sortBy.split(':')
            sort = { createdAt: parts[1]=='desc'? -1:1 }
            delete(req.query.sortBy)
        }
        else {
            sort = { createdAt: 1 }
        }
        delete req.query.limit
        delete req.query.skip 
        findTask = req.query
        findTask.owner = req.user._id
        const tasks = await task.find(findTask, null, pagination).sort(sort)
        res.send(tasks)
    }
    catch(e) {
        res.status(500).send(e)
    }
})

// getting a specific task of loggedin user
router.get('/:id', auth, async (req,res)=> {
    try {
        const Task = await task.findOne({_id: req.params.id, owner: req.user._id})
        if(!Task)
        {
            return res.send(404).send()
        }
        res.send(Task)
    }
    catch(e) {
        res.status(500).send(e)
    }
})

// updating a specific task of loggedin user
router.patch('/:id', auth, async (req,res)=> {
    try {
        const Task = await task.findOne({_id: req.params.id, owner: req.user._id})
        if(!Task)
        {
            return res.status(404).send()
        }
        for(var key in req.body)
        {
            Task[key] = req.body[key]
        }
        await Task.save()
        res.send(Task)
    }
    catch (e)
    {
        res.status(400).send(e)
    }
})

// deleting a specific task of loggedin user
router.delete('/:id', auth, async (req,res)=> {
    try {
        const Task = await task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if(!Task)
        {
            return res.status(404).send()
        }
        res.send(Task)
    }
    catch(e) {
        res.status(500).send(e)
    }
})

module.exports = router;