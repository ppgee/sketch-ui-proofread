const OS = require('os')
const fs = require('fs')
const path = require('path')

// 获取本地ip地址
const findLocalIPAddress = () => {
  const interfaces = OS.networkInterfaces()

  let IPAddress = ''
  for (const devName in interfaces) {
    const iface = interfaces[devName]

    for (let index = 0; index < iface.length; index++) {
      const alias = iface[index];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        IPAddress = alias.address
        break
      }
    }
  }

  return IPAddress
}

// 创建目录
const mkdirImgPath = function (dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirImgPath(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

module.exports = {
  findLocalIPAddress,
  mkdirImgPath
}