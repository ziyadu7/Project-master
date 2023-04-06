const mongoose = require('mongoose')
require('dotenv').config()
function mongooseConnection(){
    mongoose.set('strictQuery',true)
    mongoose.connect(process.env.MONGOOSE_CONNECTION)
}

module.exports = {
    mongooseConnection
}