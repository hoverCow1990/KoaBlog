const routerClass = require('../../servers/decorators/routers.js')
const UserSchema = require('../../servers/schema/users.js')
const multer = require('koa-multer')
const uuidV1 = require('uuid/v1')
const fs = require('fs')
const upload = multer({ dest: 'uploads/' })

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
      const { id, password } = ctx.req.body
      const { file } = ctx.req
      const filePath = file.path

      // 二次验证数据的有效性
      if (!id || /^\d+$/.test(id) || id.length > 10 || !password || /[\u4e00-\u9fa5]/g.test(password) || password.length < 5 || password.length > 15) {
        if(fs.existsSync(filePath)) fs.unlinkSync(filePath)
        ctx.throw(500, '非法请求')
        return
      }

      // 查询是否已存在相同用户名
      let userData = await UserSchema.find({id: id}, (err, docs) => {
        if (err) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
          ctx.throw(500, '查询用户名表单出错')
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

      let uuid = uuidV1()
      let insertId = ''
      const insertData = new UserSchema({
        id,
        password,
        uuid,
        score: 10,
        lv: 1
      })

      await insertData.save((err, docs) => {
        if (err) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
          ctx.throw(500, '储存用户名表单出错')
          return
        } else {
          const userFile = file.destination + docs._id
          const oldFilePath = file.path
          const newFilePath = userFile + '/logo' + '.' + file.originalname.match(/[^.]+$/)[0]
          insertId = docs._id
          if (!(fs.existsSync(userFile))) fs.mkdirSync(userFile)
          fs.rename(oldFilePath, newFilePath, err => {
            if (err) {
              ctx.throw(500, '照片处理失败')
              return
            }
          })
        }
      })

      const resultData = {
        id: insertId, // 用户序列号
        name: id,  // 用户名
        uuid
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
