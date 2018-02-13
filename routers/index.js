const user = require('./front/user.js')


const routers = [{
  url: 'user',
  Api: user
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
