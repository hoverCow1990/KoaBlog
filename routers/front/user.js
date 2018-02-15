const routerClass = require('../../servers/decorators/routers.js')
const UserSchema = require('../../servers/schema/users.js')
const $passWordUnit = require('../../lib/password.js')
const $Unit = require('../../lib/unit.js')
const multer = require('koa-multer')
const uuidV1 = require('uuid/v1')
const fs = require('fs')
const upload = multer({ dest: 'static/uploads/' })

/**
 * 前端用户路由
 * 功能 [用户基础信息, 用户注册, 用户登录, 用户退出登录, 更新详细信息, 获取所有用户信息, 签到]
 * @type {Router}
 */
@routerClass(['userDetail', 'regist', 'login', 'logout', 'uploadUserDetail', 'getUserList', 'sign'])
class User {
  constructor (Router) {
    this.init(Router)
  }

  /**
   * @method  [GET]用户基础信息
   * @path    /user
   * @return  {Object}                statue 为1时已经成功登录 没有登录0时返回msg
   * @date    2018-02-14
   */
  userDetail () {
    this.router.get('/userDetail', async (ctx, next) => {
      // id = 0 时是获取个人信息 非0则获取其他用户
      const user = ctx.session.userData
      const id = ctx.request.query.id
      const isSelf = id === '0'

      // 未登录用户
      if (isSelf && !user) {
        ctx.body = {
          statue: 0,
          msg: '请先登录'
        }
        return
      }

      const _id = isSelf ? user.id : id
      const userData = await UserSchema.findOne({ _id })

      // 乱输地址
      if (!userData) {
        ctx.body = {
          statue: 0,
          msg: '数据有误,请勿擅自改动url'
        }
        return
      }

      //传递基础信息
      const hasSigned = $Unit.isDoToday(userData.signTime).statue // 是否已经签到

      ctx.body =  {
        statue: 1,
        userDetail: {
            hasSigned,
            id: userData._id,
            ...userData._doc,
            password: null
        }
      }
    })
  }

  /**
   * @method  [POST]用户注册
   * @path    /user/regist
   * @return  {Object}                statue 为1时已经成功注册 返回用户信息
   * @date    2018-02-13
   */
  regist () {
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
      const logoType = file.originalname.match(/[^.]+$/)[0]
      const insertData = new UserSchema({
        name,
        uuid,
        logoType,
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
      const newFilePath = userFile + '/logo' + '.' + logoType
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
        logoType: insertDocs.logoType, // logo的类型 jpg?
        id: insertDocs._id, // 用户序列号
        name  // 用户名
      }

      ctx.session.userData = resultData
      ctx.body = {
        statue: 1,
        userData: resultData
      }
    })
  }

  /**
   * @method  [POST]用户登录
   * @path    /user/login
   * @return  {Object}                statue 为1时成功 0时返回msg
   * @date    2018-02-14
   */
  login () {
    this.router.post('/login', async (ctx) => {
      const { name, password } = ctx.request.body
      const userData = await UserSchema.findOne({ name })

      // 没有该用户
      if (!userData) {
        ctx.body = {
          statue: 0,
          msg: '该用户不存在'
        }
        return
      }

      // 密码解密
      const userPassword = $passWordUnit.decrypt(userData.password)

      if (password === userPassword) {
        ctx.session.userData = {
          id: userData._id,
          name: userData.name
        }
        ctx.body = {
          statue: 1,
          userData: {
            id: userData._id,
            ...userData._doc
          }
        }
      } else {
        ctx.body = {
          statue: 0,
          msg: '密码不正确'
        }
      }

    })
  }

  /**
   * @method  [GET]用户退出登录
   * @path    /user/logout
   * @return  {Object}                statue 为1时已经成功退出
   * @date    2018-02-14
   */
  logout () {
    this.router.get('/logout', ctx => {
      ctx.session.userData = null
      ctx.body = {
        statue: 1
      }
    })
  }

  /**
   * @method  [POST]更新详细信息
   * @path    /user/uploadUserDetail
   * @param   {git, blog, qq, introduce, talent}
   * @return  {Object}                statue 为1时返回用户详细
   * @date    2018-02-14
   */
  uploadUserDetail () {
    this.router.post('/uploadUserDetail', async (ctx) => {
      const user = ctx.session.userData
      const postData = ctx.request.body
      const { git, blog, qq, introduce, talent } = postData

      // 自己发的请求
      if (!qq || !introduce || !talent) {
        ctx.error(500, '非法请求')
        return
      }

      // 登录过期或者非法请求
      if (!user) {
        ctx.body = {
          statue: 401,
          msg: '请先登录'
        }
        return
      }

      // 获取用户信息
      let userData = await UserSchema.findOne({_id: user.id})
      let lastQq = userData.qq
      let score  = userData.score
      if (!lastQq) score = Number(score) + 20
      userData.git = git
      userData.blog = blog
      userData.qq = qq
      userData.introduce = introduce
      userData.talent = talent
      userData.lv = $Unit.getLv(score) // 根据分数获取等级
      await userData.save()

      ctx.body = {
        statue: 1,
        userData: {
          id: userData._id,
          ...userData._doc
        }
      }
    })
  }

  /**
   * @method  [POST]获取所有用户列表
   * @path    /user/getUserList
   * @param   {s, e} s:起始index e:终止index
   * @return  {Object}     statue 为1时获取成功  allLength: 所有数据数量
   * @date    2018-02-14
   */
  getUserList () {
    this.router.get('/getUserList', async (ctx) => {
      const {s, e} = ctx.request.query
      try {
        const userList = await UserSchema.find({}).sort({ score: -1 }).skip(Number(s)).limit(Number(e))
        const allLength = await UserSchema.count()
        const resUserList = userList.map(item => ({
          id: item._id,
          name: item.name,
          score: item.score,
          logoType: item.logoType
        }))
        ctx.body = {
          statue: 1,
          userList: resUserList,
          allLength
        }
      } catch (e) {
        ctx.error(500, '获取用户列表错误')
      }
    })
  }

  /**
   * @method  [GET]签到
   * @path    /user/sign
   * @param   {s, e} s:起始index e:终止index
   * @return  {Object}   statue 为1时获取成功  allLength: 所有数据数量
   * @date    2017-08-14
   */
  sign () {
    this.router.get('/sign', async (ctx) => {
      const user = ctx.session.userData
      if (!user) {
        ctx.body = {
          statue: 0,
          msg: '请先登录'
        }
        return
      }

      const id = user.id
      const userData = await UserSchema.findOne({_id: id})

      if (!userData) {
        ctx.body = {
          statue: 0,
          msg: '请先登录'
        }
        return
      }

      let {score, signTime, lv} = userData
      let hasSigned = $Unit.isDoToday(signTime) // 是否已经签到

      if (hasSigned.statue) {
        ctx.body = {
          statue: 0,
          msg: '今日已经有完成签到任务'
        }
      } else {
        score = Number(score) + 5 + Math.floor(Math.random() * 6)
        lv = $Unit.getLv(score)
        userData.score = score
        userData.lv = lv
        userData.signTime = hasSigned.nowDate
        await userData.save()
        ctx.body = {
          statue: 1,
          score,
          lv
        }
      }
    })
  }
}

module.exports = User
