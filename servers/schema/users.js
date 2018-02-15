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
    introduce: String,
    talent: String,
    signTime: String,
    messageTime: String,
    logoType: String
  })

// Users.statics = {
//   findUser (studentId, callback) {
//     return this
//       .findOne({ _id : studentId })
//       .populate('author')
//       .exec(callback)
//   }
// }


module.exports = mongoose.model('Users', Users, 'users')
