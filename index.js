const Constant = require('./servers/global.js')
const Koa = require('Koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const routerIndex = require('./routers/index.js')
const App = new Koa()

App.use(bodyParser({
  enableTypes: ['json', 'form', 'text']
}))

// 开启路由设置
new routerIndex().init(App, Router)

// 监听3001端口
App.listen(3001, () => {
  console.log('ok')
})
