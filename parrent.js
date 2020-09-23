// 1. 邮箱
export const isEmail = s => {
  return /^([a-zA-Z0-9_-])+@([a-zA-z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
}
// 2. 手机号
export const isMobile = s => {
  return /^1[0-9]{10}$/.test(s)
}
// 3. 电话号码
export const isTell = s => {
  return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s)
}
// 4. url地址
export const isURL = s => {
  return
}

