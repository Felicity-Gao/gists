// 将Date转化为指定格式，参数是ms,yyyy-MM-dd HH:mm:ss
export const formateDate = (ms, fmt = "yyyy-MM-dd HH:mm:ss") => {
  const date = new Date(ms)
  let fmtCopy = fmt
  const o = {
    "M+": date.getMonth() + 1,
    "d+": date.getDate(),
    "H+": date.getHours(),
    "m+": date.getMinutes(),
    "s+": date.getSeconds(),
    "q+": Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  }
  if (/(y+)/.test(fmtCopy))
    fmtCopy = fmtCopy.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length))
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmtCopy))
      fmtCopy = fmtCopy.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length)
      )
  }

  return fmtCopy
}

// 钱三位分割，并保留两位小数·
export const formateMoney = val => {
  return parseFloat(val)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// 手机号 344 分割
export const phoneNumber = s => {
  return phoneNumber.replace(/\B(?=(?:\d{4})+$)/g, '-')
}