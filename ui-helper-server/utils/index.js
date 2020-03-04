const OS = require('os')

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

module.exports = {
  findLocalIPAddress
}