/**
 * 路由类的修饰器
 * @param  {[Array]} fnLists 需要执行的方法名
 */

const routerClass = (fnLists) => (target, key, des) => {

  /**
   * 路由类初始化
   * @param  {[Object]} Router Koa-router 生成的 new Router()
   * 用于对所有路由的初始化进行新建子路由,并循环执行所有方法
   */

  target.prototype.init = function (Router) {
    this.router = new Router()
    fnLists.forEach(method => {
      this[method]()
    })
  }

  /**
   * 路由类获取当前路由
   * 在@/routers/index.js 下需要获取路由~
   */

  target.prototype.getRouter = function () {
    return this.router
  }
}

module.exports = routerClass
