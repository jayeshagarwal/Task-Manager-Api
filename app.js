const express = require('express')
const userRoutes = require('./routes/users')
const taskRoutes = require('./routes/tasks')
require('./db/mongoose')

const app = express()
const port = process.env.PORT

app.use(express.json())

app.use('/users', userRoutes)
app.use('/tasks', taskRoutes)

app.listen(port, ()=> {
    console.log("Server started on port", port);
})