const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

let Messages = new Schema({
    author: ObjectId,
    userRef: {
      type: ObjectId,
      ref: 'Users'
    },
    message: String,
    time: String,
    score: Number
})

module.exports = mongoose.model('Messages', Messages, 'messages')
