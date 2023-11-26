const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phno: {
        type: String,
    },
   
    

}, { timestamps: true })


const UserModel = mongoose.model('demouser', userSchema);

module.exports = UserModel;