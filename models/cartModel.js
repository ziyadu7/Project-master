const mongoose = require('mongoose')
const cartSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    item: [{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Products',
            required:true,
        },
        price:{
          type:Number,
          required:true
        },
        quantity:{
          type:Number,
          default:1,
          required:true
        } 
      }],
      totalPrice:{
        type:String
      },couponDiscount:{
        type:Number
      }
})

module.exports = mongoose.model('cart',cartSchema)