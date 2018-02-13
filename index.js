require('babel-core/register')()
require('babel-polyfill')
const Koa = require('Koa')
const Router = require('koa-router')
const routerIndex = require('./routers/index.js')
const App = new Koa()

// const user = new Router()
//
// users.get('/userDetail', async (ctx, next) => {
//   ctx.body = 555
// })
//
// user.use('/user', users.routes(), users.allowedMethods())
//
// app.use(user.routes())

new routerIndex().init(App, Router)

App.listen(3001, () => {
  console.log('ok')
})
