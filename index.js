const Constant = require('./servers/global.js')
const Koa = require('Koa')
const Path = require('path')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const koaStatic = require('koa-static')
const Session = require('koa-session')
const routerIndex = require('./routers/index.js')
const errorLogs = require('./lib/errorLogs.js')
const keys = require('./config/keys.js')
const config = require('./config/config.js')
const App = new Koa()

// 配置sesson
App.keys = keys.sesson
App.use(Session(config.sesson, App))

// 设定静态文件
App.use(koaStatic(Path.join(__dirname, 'static')))
// App.use(koaStatic(Path.join(__dirname + './public')))

// 设置错误日志报告中间件
App.use(async (ctx, next) => {
  ctx.error = errorLogs(ctx)
  await next()
})

// 使用bodyparse获取post请求数据
App.use(bodyParser({
  enableTypes: ['json', 'form', 'text']
}))

// 开启路由设置
new routerIndex().init(App, Router)

// 监听3001端口
App.listen(3001, () => {
  console.log('ok')
})
