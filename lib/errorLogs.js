const Logs = require('../servers/schema/logs.js')
const moment = require('moment')
const errorLogsSchema = Logs.errorLogs

const errorLogs = ctx => (code, msg) => {
  const time = moment(new Date()).format('YYYY/MM/DD,h:mm:ss')
  ctx.response.status = code
  ctx.response.body = {
    message: msg
  }
  const errorData = new errorLogsSchema({
    msg: msg,
    time: time
  })
  errorData.save()
}

module.exports = errorLogs
