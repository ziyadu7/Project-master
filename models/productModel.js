const mongoose = require('mongoose')
const productSchema = mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    brand:{
        type:String,
        require:true
    },
    price:{
        type:Number,
        require:true
    },
    discount:{
        type:Number,
    },
    stocks:{
        type:Number,
        require:true
    },
    description:{
        type:String,
        require:true
    },category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    image:{
        type:Array,
        require:true
    },is_show:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model('Products',productSchema)