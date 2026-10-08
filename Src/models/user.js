

const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,

    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 60,

    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "admin"
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    resetToken: {
        type: String,
    },
    refreshTokenexpiry: {
        type: Date,
    },
    status: {
        type: String,
        default: "active"
    },
}, {
    timestamps: true

});

const user = mongoose.model("user", userSchema)
module.exports = user;