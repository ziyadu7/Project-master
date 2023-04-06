const mongoose = require('mongoose')
const couponSchema = mongoose.Schema({
    couponName:{
        type:String,
        required:true
    },couponCode:{
        type:String,
        required:true
    },startDate:{
        type:Date,
        required:true
    },endDate:{
        type:Date,
        required:true
    },maxDiscount:{
        type:Number,
        required:true
    },minPurchase:{
        type:Number,
        required:true
    },status:{
        type:Boolean,
        default:true
    },userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
})

module.exports = mongoose.model('coupon',couponSchema)