// const mongoose = require('mongoose')
const morgan = require('morgan')
const userRout = require('./router/userRout')
const adminRout = require('./router/adminRout')
const bodyParser = require('body-parser')
const session = require('express-session')
const nocache = require('nocache')
const path = require('path')
const config = require('./config/config')
require('dotenv').config();

config.mongooseConnection()
// const cookieParser = require('cookie-parser')

// mongoose.set('strictQuery', false)
// mongoose.connect('mongodb://127.0.0.1:27017/project')

const express = require('express')
// const { config } = require('dotenv')
const app = express()
app.use(morgan("dev"));
app.use(nocache())
app.set('view engine','ejs')
app.set('views','./views/users')

app.use(session({ secret:process.env.SECRET_KEY , cookie: { maxAge: 60000 * 100 }, saveUninitialized: true, resave: true }))
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/', userRout)
app.use('/admin', adminRout)
app.use((err,req,res,next)=>{
    res.status(err.status||500)
    res.render('error',{err})
})

app.listen(process.env.PORT, () => {
    console.log('server running');
})
