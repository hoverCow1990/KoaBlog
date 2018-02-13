const routerClass = require('../../servers/decorators/routers.js')

/**
 * 前端用户路由
 * @type {Router}
 */
@routerClass(['getUser'])
class User {
  constructor (Router) {
    this.init(Router)
  }

  /**
   * 用户基础信息
   * @path  user
   * @return  {Object}                statue 为1时已经成功登录 没有登录0时返回msg
   * @date    2017-08-21
   */
  getUser () {
    this.router.get('/userDetail', async (ctx, next) => {
      console.log(ctx.req)
      ctx.body = 99
    })
  }
}

module.exports = User
