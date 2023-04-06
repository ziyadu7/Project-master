const mongoose = require('mongoose')
const orderSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        
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
      start_date:{
        type:String
      },
      delivered_date:{
        type:String
      },
      totalPrice:{
        type:Number
      },
      is_delivered:{
        type:Boolean,
        default:false
      },
      user_cancelled:{
        type:Boolean,
        default:false
      },
      admin_cancelled:{
        type:Boolean,
        default:false
      },
      orderCount: {
        type: Number,
        default: 0
      },
      paymentType:{
        type:String
      },
      address:{
        type:Array
      }
})

module.exports = mongoose.model('orders',orderSchema)