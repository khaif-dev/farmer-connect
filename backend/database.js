// importing mongoose and dotenv
const mongoose = require ('mongoose');
require('dotenv').config();

// connect to mongoose
async function connectDB(){
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('connected to mongodb');
}

module.exports = { connectDB, mongoose };