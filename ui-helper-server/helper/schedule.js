const schedule = require('node-schedule')
const fs = require('fs')

// 20分钟
const Minutes_20 = 1200000

class ImgScheduler {
  constructor() {
    this.imgPathList = []
    this.scheduler = null

    this.setup()
  }

  // 加入图片路径
  addImgPath(imgPath) {
    // 当前时间
    const nowTime = (new Date()).valueOf() + Minutes_20

    // 填充图片
    this.imgPathList.push({
      path: imgPath,
      expiryTime: nowTime
    })
  }

  // 删除图片
  deleteExpiryImg() {
    if (this.imgPathList.length === 0) return
    this.imgPathList = this.imgPathList.filter((imgInfo) => {
      const nowTime = (new Date()).valueOf()

      // 是否过期
      let isExpiry = nowTime >= imgInfo.expiryTime
      isExpiry && fs.unlinkSync(imgInfo.path)
      console.log(`图片 ${imgInfo.path}: ${isExpiry ? '已过期，已删除' : '未过期'}`)
      return !isExpiry
    })
  }

  // 建立定时任务
  setup() {
    console.log('setup img scheduler')
    this.scheduler = schedule.scheduleJob('*/5 * * * *', () => {
      console.log('img scheduler is starting')
      this.deleteExpiryImg()
    })
  }
}

module.exports = ImgScheduler