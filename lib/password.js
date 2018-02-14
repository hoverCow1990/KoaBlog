const crypto = require('crypto')
const key = require('../config/keys.js')
const passwordKey = key.password

// 用户密码加密

const $passWordUnit = {
  // 加密
  encrypt (password) {
    let cipher = crypto.createCipher('aes-256-cbc', passwordKey)
    password = cipher.update(password, 'utf8', 'hex')
    password += cipher.final('hex')
    return password
  },
  // 解密
  decrypt (password) {
    let decipher = crypto.createDecipher('aes-256-cbc', passwordKey)
    password = decipher.update(password, 'hex', 'utf8')
    password += decipher.final('utf8')
    return password
  }
}

module.exports = $passWordUnit
