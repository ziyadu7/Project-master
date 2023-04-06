const mongoose = require('mongoose')
const bannerSchema= mongoose.Schema({
    image:{
        type:String,
        required:true
    },
    heading1:{
        type:String,
        required:true
    },
    heading2:{
        type:String,
        required:true
    },
    heading3:{
        type:String,
        required:true
    },
    description1:{
        type:String,
        required:true
    },
    description2:{
        type:String,
        required:true
    },
    description3:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('banner',bannerSchema)