const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

let Users = new Schema({
    author: ObjectId,
    name: String,
    password: String,
    uuid: String,
    lv: Number,
    score: Number,
    qq: String,
    git: String,
    blog: String,
    introduce: String
  })

module.exports = mongoose.model('Users', Users, 'users')
