const SocketIO = require('socket.io')
const ss = require('socket.io-stream')
const fs = require('fs')
const ImgSchedule = require('./helper/schedule')
const Constants = require('./constants')

// socket 事件
const SOCKETIO_EVENT = {
  DISCONNECTION: 'disconnect',
  CONNECTION: 'connection',
  REGISTER_CLIENT: 'register-client',
  REGISTER_CLIENT_SUCCESS: 'register-client-success',
  REGISTER_PENGUIN: 'register-penguin',
  REGISTER_PENGUIN_SUCCESS: 'register-penguin-success',
  UPLOAD_IMAGE: 'upload-image',
  GET_CONNECTED_PENGUIN: 'get-connected-penguin',
  SERVER_SEND_IMAGE: 'server-send-image'
}

class HelperSocket {
  constructor(server) {
    // 生成 io 实例
    this.io = SocketIO(server)

    // 连接设备
    this.connectList = {
      device: [], // 客户端列表
      penguin: [] // 插件列表
    }

    // 插件别名
    this.penguinAlias = {}

    this.initSocket()

    this.imgSchedule = new ImgSchedule()
  }

  // 注册连接
  registerSocket(type, socketId) {
    this.connectList[type] && this.connectList[type].push(socketId)
  }

  // 注销连接
  logoutSocket(type, socketId) {
    if (!this.connectList[type]) return
    // 删除连接信息
    this.connectList[type] = this.connectList[type].filter((connSocketId) => {
      return socketId !== connSocketId
    })

    // 遍历别名，删除socket id
    for (const aliasName in this.penguinAlias) {
      if (this.penguinAlias.hasOwnProperty(aliasName)) {
        const connSocketId = this.penguinAlias[aliasName];
        if (socketId === connSocketId) {
          delete this.penguinAlias[aliasName]
        }
      }
    }
    // delete this.penguinAlias[socketId]
  }

  // 广播给相关的插件
  broadcastTransferImage(penguinId, filePath) {
    // 读取文件
    const readStream = fs.createReadStream(filePath)

    // 这里处理应为单点，可以优化
    for (let index in this.io.sockets.connected) {
      const socketTo = this.io.sockets.connected[index]
      if (socketTo.id !== penguinId) continue
      // console.log(socketTo)
      // 传输文件
      const stream = ss.createStream()
      ss(socketTo).emit(SOCKETIO_EVENT.SERVER_SEND_IMAGE, stream)

      // 开始传输
      readStream.pipe(stream)
    }
  }

  // 广播给所有连接着的手机设备
  broadcastPenguinListToClient() {
    try {
      for (const index in this.io.sockets.connected) {
        const socketTo = this.io.sockets.connected[index]
        if (this.connectList.device.indexOf(socketTo.id) === -1) continue

        // 返回已连接的插件用户
        socketTo.emit(SOCKETIO_EVENT.GET_CONNECTED_PENGUIN, this.penguinAlias)
      }
    } catch (error) {
      console.error(error)
    }
  }

  // 初始化socket
  initSocket() {
    // 连接成功
    this.io.on(SOCKETIO_EVENT.CONNECTION, async socket => {
      const { type } = socket.handshake.query

      // 注册设备
      this.registerSocket(type, socket.id)

      // 只有设备才发送
      if (type === 'device') {
        // 返回已连接的插件用户
        socket.emit(SOCKETIO_EVENT.GET_CONNECTED_PENGUIN, this.penguinAlias)
      }

      // 注册插件
      socket.on(SOCKETIO_EVENT.REGISTER_PENGUIN, (penguinAlias) => {
        console.log('触发插件注册事件')
        if (!penguinAlias) return

        // 填充别名
        this.penguinAlias[penguinAlias] = socket.id

        // 将注册好的插件返回给客户端
        this.broadcastPenguinListToClient()
      })

      // todo 注册客户端 暂时未用
      socket.on(SOCKETIO_EVENT.REGISTER_CLIENT, (clientAlias) => {
        console.log(clientAlias, ' 触发注册事件')
        socket.emit(SOCKETIO_EVENT.REGISTER_CLIENT_SUCCESS, '注册成功')
      })

      // 等待设备传输图片
      ss(socket).on(SOCKETIO_EVENT.UPLOAD_IMAGE, (stream, data) => {
        const { name, penguinId } = data
        if (!penguinId) {
          console.log('找不到插件id')
          return
        }

        // 文件路径
        const filePath = `${Constants.imgTempPath()}/${name}`
        // 加入定时删除任务中
        this.imgSchedule.addImgPath(filePath)
        // 接收文件结束后广播到插件
        stream.pipe(fs.createWriteStream(filePath).on('close', () => {
          // 传输文件
          this.broadcastTransferImage(penguinId, filePath)
        }))

        // console.log(data)
      })

      // 失去连接
      socket.on(SOCKETIO_EVENT.DISCONNECTION, () => {
        this.logoutSocket(type, socket.id)
        console.log(`${type}: ${socket.id} 已下线`)
      })

      console.log(`${type}: ${socket.id} 加入 server 成功`)
    })
  }
}

module.exports = HelperSocket