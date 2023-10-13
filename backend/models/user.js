const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    Name:{
        type: String
    }
})

module.exports = mongoose.model("user", UserSchema)