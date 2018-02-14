require('babel-core/register')()
require('babel-polyfill')
const mongoose = require('mongoose')

mongoose.Promise = global.Promise

// 链接mongdb数据库
mongoose.connect('mongodb://localhost/blog', {
  useMongoClient:true
})
