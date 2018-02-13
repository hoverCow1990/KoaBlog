require('babel-core/register')()
require('babel-polyfill')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/blog')
