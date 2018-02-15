const User = require('./front/user.js')
const Message = require('./common/Message.js')

const routers = [{
  url: 'user',
  Api: User
}, {
  url: 'message',
  Api: Message
}]

class RouterIndex {
  init (App, Router) {
    routers.forEach(({url, Api}) => {
      let router = new Api(Router).getRouter()
      let routerMain = new Router().use(`/${url}`, router.routes(), router.allowedMethods())
      App.use(routerMain.routes())
    })
  }
}

module.exports = RouterIndex
