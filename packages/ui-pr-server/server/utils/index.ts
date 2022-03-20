import OS from 'os'

// 是否为对象
export const isObject = (obj: any) => {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

// 获取本地ip地址
export const findLocalIPAddress = () => {
  const interfaces = OS.networkInterfaces()

  let IPAddress = ''
  for (const devName in interfaces) {
    const iface = interfaces[devName]

    for (let index = 0; index < iface!.length; index++) {
      const alias = iface![index];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        IPAddress = alias.address
        break
      }
    }
  }

  return IPAddress
}
