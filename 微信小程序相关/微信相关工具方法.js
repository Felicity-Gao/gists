// 在组件中设置本页的data
export const setCbData = (data, cb = () => { }, ctx = getCurrentPages()[getCurrentPages().length - 1]) => {
  ctx.setData(data, () => {
    loading(false);
    cb()
  })
}
// 设置上一页的data
export const setPrevData = (data, prevPage = getCurrentPages()[getCurrentPages().length - 2]) => {
  prevPage.setData(data)
  wx.navigateBack()
}