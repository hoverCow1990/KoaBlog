const Config = require('../config/config.js')
const moment = require('moment')
const lvConfig = Config.lvConfig

const $Unit = {
  // 根据分数获取用户的等级
  getLv (score) {
    if (score >= lvConfig[5]) return 6
    return lvConfig.findIndex(item => item > score)
  },
  // 获取用户今日是否做过此事
  isDoToday (lastTime) {
    const nowDate = moment(new Date()).format('YYYYMMDD')
    return {
        statue: lastTime === nowDate,
        nowDate
    }
  },
  // 用户是否可以留言
  isDoTodayCount (messageTime, count) {
    const nowDate = moment(new Date()).format('YYYYMMDD')
    const oneDayCount = Config.oneDayCount.message
    let statue = true
    // 没有messageTime
    if (!messageTime) {
      messageTime = '1' + nowDate
      statue = true
    } else {
      let count = Number(messageTime[0])
      messageTime = messageTime.substring(1)
      if (messageTime === nowDate) {
        if (count < oneDayCount) {
          messageTime = ++count + messageTime
        } else {
          messageTime = count + messageTime
          statue = false
        }
      } else {
        messageTime = '1' + nowDate
      }
    }
    return {
      statue,
      msg: `留言板每天至多留言${oneDayCount}次`,
      messageTime
    }
  },
  // 验证信息有有效性
  validateMessage ({message, score}) {
    if (!message || !message.trim() || /^\d+$/.test(message) || /<\s*\/?\s*(script|div|span|p|h1|h2|h3|h4|h5|h6|style|head|body|html|button|canvas|code|ul|li|dd|dt|del|img|iframe|link|input|video|testarea|tr|td|strong).*?>/.test(message)) {
      return false
    }
    if (score > 5 || score < 1) return false
    return true
  }
}

module.exports = $Unit
