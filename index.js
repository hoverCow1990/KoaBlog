const Koa = require('Koa')
const app = new Koa()

app.use(async (ctx, next) => {
  ctx.error = (code, message) => {
    // if (typeof code === 'string') {
    //   message = code
    //   code = 500
    // }
    ctx.throw(500, '服务器错误')
  }
  next()
})

//
// app.use(async (ctx, next) => {
//   // var name = await getName()
//   // ctx.body = '222'
//   // ctx.error(400, 'name')
//   next()
// })

app.use(async (ctx, next) => {
  ctx.error(500, 'name222')
  ctx.body = ctx.body + ' ok'
})

// const getName = () => {
//   return new Promise((reslove, reject) => {
//     setTimeout(() => {
//       reslove('hehe')
//     }, 3000)
//   })
// }
//
app.listen(3001, () => {
  console.log('ok')
})
