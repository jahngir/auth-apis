const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User',
    },
    otp:{
        type:Number,
        required:true
    }
}, {
    timestamps:{
        type:Date,
        default:Date.now,
        required:true,
        get:(timestamp)=> timestamp.getTime()


    },
})

module.exports = mongoose.model("OTP", otpSchema)