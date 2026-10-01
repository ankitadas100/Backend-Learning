

const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true,
    },
    email: {
        type: String,
        required: true,
        trim:true,
        unique: true,

    },
    age: {
        type: Number,
        required: true,
        min:18,
        max:60,
        
    },
    gender: {
    type: String,
    enum: ["Male", "Female", "Other"]
},
status: {
    type: String,
    default: "active"
}
})
const user = mongoose.model("user", userSchema)
module.exports = user;