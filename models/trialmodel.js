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
    usertype: {
        type: String,
        default: 'trial'
    },
    allowed: {
        type: Boolean,
        default: true,

    }


}, { timestamps: true })


const UserModel = mongoose.model('trailuser', userSchema);

module.exports = UserModel;