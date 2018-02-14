const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

let ErrorLogs = new Schema({
    author: ObjectId,
    msg: String,
    time: String
  })

module.exports = {
  errorLogs: mongoose.model('ErrorLogs', ErrorLogs, 'errorLogs')
}
