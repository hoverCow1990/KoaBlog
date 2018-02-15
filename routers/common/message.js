const routerClass = require('../../servers/decorators/routers.js')
const UserSchema = require('../../servers/schema/users.js')
const MessageSchema = require('../../servers/schema/message.js')
const $Unit = require('../../lib/unit.js')

/**
 * 消息Api
 * 功能 []
 * @type {Router}
 */
@routerClass(['postMessage', 'getMessage'])
class Messages {
  constructor (Router) {
    this.init(Router)
  }

  /**
   * @method  [POST]用户留言
   * @path     message/postMessage
   * @return  {Object}                statue 为1时已经成功留言 返回留言列表信息
   * @date    2018-02-14
   */
  postMessage () {
    this.router.post('/postMessage', async (ctx, next) => {
      const user = ctx.session.userData
      let { st, end, message, score } = ctx.request.body

      // 用户未登录
      if (!user) {
        ctx.body = {
          statue: 0,
          msg: '请先登录'
        }
        return
      }

      // 验证用户数据的有效性
      const isCanSaveMsg = $Unit.validateMessage({message, score})

      if (!isCanSaveMsg) {
        ctx.body = {
          statue: 0,
          msg: '非法上传数据!'
        }
      }

      // 获取用户信息
      const UseData = await UserSchema.findOne({_id: user.id})

      if (!UseData) {
        ctx.body = {
          statue: 0,
          msg: '请先登录'
        }
        return
      }

      // 验证用户每天只能发布2次数据
      const isCanSaveTime = $Unit.isDoTodayCount(UseData.messageTime)

      if (!isCanSaveTime.statue) {
        ctx.body = {
          statue: 0,
          msg: isCanSaveTime.msg
        }
        return
      }

      // 用户的发布次数 + 时间
      let messageId = ''
      const messageTime = isCanSaveTime.messageTime
      const insertMessageData = new MessageSchema({
        userRef: user.id,
        time: messageTime.substring(1),
        message,
        score
      })

      // 保存留言数据
      try {
        const messageData = await insertMessageData.save()
        messageId = messageData._id
      } catch (e) {
        ctx.error(500, '保存留言失败')
        return
      }

      // 更新用户数据
      try {
        let userScore = UseData.score + 15
        let lv = $Unit.getLv(userScore)
        UseData.score = userScore
        UseData.lv = lv
        UseData.messageTime = messageTime
        await UseData.save()

        const res = await this.getMessageList(st, end)
        if (!res) {
          ctx.body = {
            statue: 0,
            msg: '留言数据获取失败,请刷新页面'
          }
          return
        }
        ctx.body = {
          statue: 1,
          messageList: res.messageList,
          allListLength: res.allListLength,
          userLv: lv
        }
      } catch (e) {
        // 处理用户数据保存时失败 移除发布的留言
        await MessageSchema.remove({_id: messageId})
        ctx.error(500, '留言后用户数据更新失败')
        return
      }
    })
  }

  /**
   * @method  [GET]获取留言
   * @path    message/getMessage
   * @return  {Object}                statue 为1时已经成功获取 返回留言列表信息
   * @date    2018-02-14
   */
  getMessage () {
    this.router.get('/getMessage', async (ctx, next) => {
      const { st, end } = ctx.request.query
      const res = await this.getMessageList(st, end)
      if (!res) {
        ctx.error(500, '查询数据错误')
        return
      }
      ctx.body = {
        statue: 1,
        messageList: res.messageList,
        allListLength: res.allListLength
      }
    })
  }

  /**
   * @method  [GET]获取留言列表封装
   * @return  {Object}                statue 返回留言列表信息
   * @date    2018-02-14
   */
  getMessageList (st, end) {
    return new Promise(async (reslove, reject) => {
      try {
        const allListLength = await MessageSchema.count()
        const messageListData = await MessageSchema.find().sort({_id: -1}).skip(Number(st)).limit(Number(end)).populate('userRef')
        const messageList = messageListData.map(item => ({
          time: item.time,
          message: item.message,
          score: item.score,
          user: {
            id: item.userRef._id,
            name: item.userRef.name,
            lv: item.userRef.lv,
            score: item.userRef.score,
            logoType: item.userRef.logoType
          }
        }))
        reslove ({
          messageList,
          allListLength
        })
      } catch (e) {
        reject(false)
      }
    })
  }
}

module.exports = Messages
