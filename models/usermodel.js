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
    password: {
        type: String,

    },
    subid: {
        type: String,
        default: null,
    },
    plan: {
        type: String,
        default: null
    },
    allowedwords: {
        type: Number,
        default: 0
    },
    remainingwords: { type: Number, default: 0 },
    allowed: {
        type: Boolean,
        default: false
    },
    customerid: {
        type: String,

    },
    paraphrasinglimit: {
        type: Number,
        default: 0
    }
}, { timestamps: true })


const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;