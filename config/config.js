const sesson = {
  key: 'koa:sess',
  maxAge: 86400000,
  overwrite: true, /** can overwrite or not (default true) */
  httpOnly: true, /** httpOnly or not (default true) */
  signed: true, /** signed or not (default true) */
  rolling: false, /** Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
}

const lvConfig = [0, 150, 350, 700, 2000, 4200]

const oneDayCount = {
  message: 50
}


module.exports = {
  sesson,
  lvConfig,
  oneDayCount
}
