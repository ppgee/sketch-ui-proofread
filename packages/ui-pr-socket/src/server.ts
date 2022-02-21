import { Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'
import { readFileSync } from 'fs'

import getUuid from './shared/uuid'
import { SOCKET_EVENT } from './shared/events'
import { SClientToServerEvents, SInterServerEvents, SServerToClientEvents, SocketFirstReqQuery, SocketFrom, SocketData, SocketFileOptions } from './types/socket'

type ServerSocket = Socket<SServerToClientEvents, SClientToServerEvents, SInterServerEvents, SocketData>

class SocketServer {
  io: Server
  rooms: { [key: string]: string }
  saveToImageFn: (params: SocketFileOptions) => Promise<string>

  constructor(server: HttpServer, options: { saveToImageFn: (params: SocketFileOptions) => Promise<string> }) {
    // 生成 io 实例
    this.io = new Server<ServerSocket>(server, {
      cors: {
        origin: '*'
      }
    })
    this.rooms = {}
    // 服务器保存图片函数
    this.saveToImageFn = options.saveToImageFn

    this.initSocket()
  }

  // 初始化socket server
  initSocket() {
    // 监听socket新连接情况
    this.io.on(SOCKET_EVENT.SERVER_CONNECTION, async (socket: ServerSocket) => {
      const query = socket.handshake.query as SocketFirstReqQuery
      const { socketFrom } = query

      console.log('server socket msg：', socketFrom)

      // 如果不存在直接退出
      if (!socketFrom) {
        return
      }

      switch (socketFrom) {
        case 'device':
          this.initDeviceSocket(socket)
          break;
        case 'plugin':
          this.initPluginSocket(socket)
          break;
        default:
          break;
      }

      // 失去连接
      socket.on(SOCKET_EVENT.DISCONNECTION, () => {
        this.logoutSocket({
          socketFrom: socketFrom,
          roomName: socket.rooms[0],
          socketId: socket.id
        })
        console.log(`${socketFrom}: ${socket.id} 已下线`)
      })

      console.log(`${socketFrom}: ${socket.id} 加入 server 成功`)
    })
  }

  logoutSocket(options: { socketFrom: SocketFrom; roomName: string; socketId: string }) {
    const { socketFrom, roomName, socketId } = options

    if (socketFrom === 'plugin') {
      delete this.rooms[roomName]
      this.io.socketsLeave(roomName)
    } else { // socketFrom === 'device'
      this.io.in(socketId).socketsLeave(roomName)
    }

    this.io.emit('CLIENT_OUT_ROOM')
  }

  // 初始化设备端socket
  initDeviceSocket(socket: ServerSocket) {
    // 发送当前的插件列表
    socket.emit(SOCKET_EVENT.CLIENT_GET_ROOMS, Object.keys(this.rooms))

    socket.on(SOCKET_EVENT.UPLOAD_IMAGE, async (options) => {
      // 判断是否进入了对应的插件
      if (socket.rooms.size < 1) {
        console.log('找不到插件')
        socket.emit(SOCKET_EVENT.UPLOAD_IMAGE_FAILURE, { msg: '找不到插件！' })
        return
      }

      if (!this.saveToImageFn) {
        return
      }

      const filepath = await this.saveToImageFn(options)
      if (!filepath) {
        socket.emit(SOCKET_EVENT.UPLOAD_IMAGE_FAILURE, { msg: '服务器出错了！' })
      }
      const [room,] = socket.rooms[0]
      this.broadcastTransferImage(room, filepath)
    })
  }

  // 初始化插件端socket
  initPluginSocket(socket: ServerSocket) {
    socket.on(SOCKET_EVENT.PLUGIN_REGISTER, ({id, room}) => {
      if (this.checkExistRoom(room)) {
        socket.emit(SOCKET_EVENT.PLUGIN_REGISTER_FAILURE, {
          msg: '名字已存在'
        })
        return
      }

      this.rooms[room] = id
      socket.join(room)
      this.broadcastRoomsToClient()
      socket.emit(SOCKET_EVENT.PLUGIN_REGISTER_SUCCESS, room)
    })
  }

  checkExistRoom(room: string) {
    return !!this.rooms[room]
  }

  // 将注册好的插件返回给客户端
  broadcastRoomsToClient() {
    try {
      this.io.emit(SOCKET_EVENT.CLIENT_GET_ROOMS, Object.keys(this.rooms))
    } catch (error) {
      console.error(error)
    }
  }

  // 广播传输图片
  broadcastTransferImage(room: string, filepath: string) {
    // 读取文件
    const fileBuffer = readFileSync(filepath)
    this.io.to(room).emit(SOCKET_EVENT.SERVER_SEND_IMAGE, fileBuffer)
  }
}

export {
  getUuid,
  SocketServer,
}