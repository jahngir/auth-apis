const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_Verified:{
        type:Boolean,
        default:false //true for verified
    },
    image:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model("User",userSchema)