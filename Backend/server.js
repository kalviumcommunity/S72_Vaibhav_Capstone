const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
const port = 3000

const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');


app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI)
.then(()=>console.log('Connected to database successfully!'))
.catch((err)=>console.error('There was a error in connecting the database: ',err));

app.get('/',(req,res)=>{
    res.send("Hello!");
})

app.listen(port,(req,res)=>{
    console.log(`The website is running on http://localhost:${port}`)
})