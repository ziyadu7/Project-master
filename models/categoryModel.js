const mongoose = require('mongoose')
const categorySchema= mongoose.Schema({
    category:{
        type:String,
        require:true
    }
})

module.exports = mongoose.model('category',categorySchema)