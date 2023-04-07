const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    image:{
        type:Buffer,
    },
    address:{
        type:Array
        },
    is_admin:{
        type:Number,
        required:true
    },
    is_verified:{
        type:Number,
        default:0
    },is_blocked:{
        type:Number,
        default:0
    },wishlist:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Products'
    }],wallet:{
        type:Number,
    }
})

module.exports = mongoose.model('User',userSchema)