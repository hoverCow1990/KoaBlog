const routerClass = require('../../servers/decorators/routers.js')
const UserSchema = require('../../servers/schema/users.js')
const $passWordUnit = require('../../lib/password.js')
const multer = require('koa-multer')
const uuidV1 = require('uuid/v1')
const fs = require('fs')
const upload = multer({ dest: 'static/uploads/' })

/**
 * 前端用户路由
 * @type {Router}
 */
@routerClass(['userDetail', 'regist'])
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
  userDetail () {
    this.router.get('/userDetail', async (ctx, next) => {
      ctx.body = 333
    })
  }

  async regist () {
    this.router.post('/regist', upload.single('file'), async (ctx, next) => {
      const { name, password } = ctx.req.body
      const { file } = ctx.req
      const filePath = file.path

      // 二次验证数据的有效性
      if (!name || /^\d+$/.test(name) || name.length > 10 || !password || /[\u4e00-\u9fa5]/g.test(password) || password.length < 5 || password.length > 15) {
        if(fs.existsSync(filePath)) fs.unlinkSync(filePath)
        ctx.error(500, '非法请求')
        return
      }

      // 查询是否已存在相同用户名
      let userData = await UserSchema.find({name: name}, (err, docs) => {
        if (err) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
          ctx.error(500, '查询用户名表单出错')
          return
        }
      })

      // 存在相同用户后的操作
      if (userData && userData.length) {
        ctx.body = {
          statue: 0,
          msg: '该用户名已被注册'
        }
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        return
      }

      // 生成唯一的uuid
      let uuid = uuidV1()
      const insertData = new UserSchema({
        name,
        uuid,
        lv: 1,
        score: 10,
        password: $passWordUnit.encrypt(password)
      })

      //储存新数据
      const insertDocs = await insertData.save()

      // 储存失败
      if (!insertDocs) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        return ctx.error(500, '储存用户名表单出错')
      }

      // 将图片放置如对应的文件夹
      const userFile = file.destination + 'user/' + insertDocs._id
      const oldFilePath = file.path
      const newFilePath = userFile + '/logo' + '.' + file.originalname.match(/[^.]+$/)[0]
      if (!(fs.existsSync(userFile))) fs.mkdirSync(userFile)
      try {
        fs.renameSync(oldFilePath, newFilePath)
      } catch (e) {
        await UserSchema.remove({name: name}) // 文件没有处理好的情况下 删除注册之前名
        fs.unlinkSync(filePath)
        ctx.error(500, '照片处理失败')
        return
      }

      const resultData = {
        id: insertDocs._id, // 用户序列号
        name  // 用户名
      }

      // req.session.userData = userData
      ctx.body = {
        statue: 1,
        userData: resultData
      }
    })
  }
}

module.exports = User
