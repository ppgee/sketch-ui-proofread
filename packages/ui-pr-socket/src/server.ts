import { Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'
import { readFileSync } from 'fs'

import getUuid from './shared/uuid'
import { SOCKET_EVENTS, SERVER_EMIT_EVENTS, CLIENT_EMIT_EVENTS } from './shared/events'
import { ServerSocket, SocketFirstReqQuery, SocketFrom, SocketData, SocketFileOptions, RoomList, DBActionRoomFunction, roomFormatter } from './types/socket'

class SocketServer {
  io: Server
  rooms: RoomList
  saveToImageFn: (params: SocketFileOptions) => Promise<string>
  updateRoomsToDB: DBActionRoomFunction

  constructor(server: HttpServer, options: { rooms: RoomList, saveToImageFn: (params: SocketFileOptions) => Promise<string>, updateRoomsToDB: DBActionRoomFunction }) {
    // 生成 io 实例
    this.io = new Server<ServerSocket>(server, {
      cors: {
        origin: '*'
      }
    })
    this.rooms = options.rooms || {}
    // 服务器保存图片函数
    this.saveToImageFn = options.saveToImageFn
    // 更新db
    this.updateRoomsToDB = options.updateRoomsToDB

    this.initSocket()
  }

  // 初始化socket server
  initSocket() {
    // 监听socket新连接情况
    this.io.on(SOCKET_EVENTS.CONNECTION, async (socket: ServerSocket) => {
      const query = socket.handshake.query as SocketFirstReqQuery
      const { socketFrom, id } = query

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

      socket.on(CLIENT_EMIT_EVENTS.OUT_ROOM, async ({ id, room }) => {
        try {
          if (socketFrom === 'device') {
            socket.leave(room)
            return
          }

          if (this.checkRoomOwnerByName(id, room)) {
            this.io.socketsLeave(room)
            await this.updateRoomsToDB({
              action: 'remove',
              key: room,
              value: {
                id,
                online: false
              }
            })
          } else {
            socket.leave(room)
          }

          socket.emit(SERVER_EMIT_EVENTS.OUTED_ROOM, { id, room })
        } catch (error) {
          socket.emit(SERVER_EMIT_EVENTS.OUT_ROOM_FAIL, { msg: error })
        }
      })

      // 客户端失去连接
      socket.on(SOCKET_EVENTS.DISCONNECTING, (reason) => {
        console.log(`${socketFrom}: ${id} 下线了`)
        console.log(`下线原因：${reason}`)
        this.logoutSocket({
          id,
          socketFrom,
          roomName: socket.rooms[0],
          socketId: socket.id
        })
      })

      // 失去连接
      socket.on(SOCKET_EVENTS.DISCONNECTION, () => {
        console.log(`${socketFrom}: ${id} 失去连接`)
        // socket.emit(SERVER_EMIT_EVENTS.OUT_ROOM, {
        //   msg: '失去连接下线'
        // })
      })

      console.log(`${socketFrom}: ${id} 加入 server 成功`)
    })
  }

  async logoutSocket(options: { roomName: string; socketId: string, id: string, socketFrom: SocketFrom }) {
    const { roomName, socketId, socketFrom, id } = options
    this.io.in(socketId).socketsLeave(roomName)

    // 如果是插件端，需要更新房间状态
    if (socketFrom === 'plugin') {
      this.rooms = await this.updateRoomsToDB({
        action: 'update',
        key: roomName,
        value: {
          id,
          online: false
        }
      })
      this.broadcastRoomsToClient()
    }
  }

  // 初始化设备端socket
  initDeviceSocket(socket: ServerSocket) {
    // 发送当前的插件列表
    socket.emit(SERVER_EMIT_EVENTS.LIST_ROOMS, this.formatRooms())

    socket.on(CLIENT_EMIT_EVENTS.JOIN_ROOM, ({ id, room }) => {
      if (!this.checkExistRoom(room)) {
        socket.emit(SERVER_EMIT_EVENTS.JOIN_ROOM_FAIL, { msg: '找不到插件！' })
        return
      }

      if (this.checkJoinedRoom(socket, room)) {
        socket.emit(SERVER_EMIT_EVENTS.JOIN_ROOM_FAIL, { msg: '已选定插件！' })
        return
      }

      this.joinRoom(socket, room)
    })

    socket.on(CLIENT_EMIT_EVENTS.SEND_IMAGE, async (options) => {
      // 判断是否进入了对应的插件
      if (socket.rooms.size < 1) {
        console.log('找不到插件')
        socket.emit(SERVER_EMIT_EVENTS.GET_IMAGE_FAIL, { msg: '找不到插件！' })
        return
      }

      if (!this.saveToImageFn) {
        return
      }

      const filepath = await this.saveToImageFn(options)
      if (!filepath) {
        socket.emit(SERVER_EMIT_EVENTS.GET_IMAGE_FAIL, { msg: '服务器出错了！' })
      }
      const [room,] = socket.rooms[0]
      this.broadcastTransferImage(room, filepath)
    })

    socket.on(CLIENT_EMIT_EVENTS.PULL_ROOMS, () => {
      socket.emit(SERVER_EMIT_EVENTS.LIST_ROOMS, this.formatRooms())
    })
  }

  // 初始化插件端socket
  async initPluginSocket(socket: ServerSocket) {
    const { id } = socket.handshake.query as SocketFirstReqQuery

    // 查看是否已经建立房间，如果是，直接加入房间即可
    try {
      const room = this.checkRoomOwner(id)
      if (room.length !== 0 && !this.checkJoinedRoom(socket, room)) {
        this.joinRoom(socket, room)
        // 如果是插件端，需要更新房间状态
        this.rooms = await this.updateRoomsToDB({
          action: 'update',
          key: room,
          value: {
            id,
            online: true
          }
        })
        this.broadcastRoomsToClient()

        return
      }
    } catch (error) {
      console.log('error', error)
    }

    socket.on(CLIENT_EMIT_EVENTS.CREATE_ROOM, async ({ id, room }) => {
      try {
        if (this.checkRoomOwnerByName(id, room) && this.checkJoinedRoom(socket, room)) {
          socket.emit(SERVER_EMIT_EVENTS.CREATED_ROOM_FAIL, {
            msg: '已加入连接'
          })
          return
        }

        if (this.checkExistRoom(room)) {
          socket.emit(SERVER_EMIT_EVENTS.CREATED_ROOM_FAIL, {
            msg: '名字已存在'
          })
          return
        }

        this.rooms[room] = {
          id,
          online: true
        }
        socket.join(room)
        socket.emit(SERVER_EMIT_EVENTS.CREATED_ROOM, room)
        await this.updateRoomsToDB({
          action: 'add',
          key: room,
          value: this.rooms[room]
        })
        this.broadcastRoomsToClient()
      } catch (error) {
        socket.emit(SERVER_EMIT_EVENTS.CREATED_ROOM_FAIL, {
          msg: '服务器异常'
        })
      }
    })
  }

  joinRoom(socket: ServerSocket, room: string) {
    if (this.hasMoreRoom(socket)) {
      socket.emit(SERVER_EMIT_EVENTS.JOIN_ROOM_FAIL, { msg: '已选定插件，暂不支持多插件！' })
      return
    }
    socket.join(room)
    socket.emit(SERVER_EMIT_EVENTS.JOINED_ROOM, room)
  }

  hasMoreRoom(socket: ServerSocket): boolean {
    return socket.rooms.size >= 1
  }

  checkExistRoom(room: string): boolean {
    return !!this.rooms[room]
  }

  checkJoinedRoom(socket: ServerSocket, room: string): boolean {
    return socket.rooms.has(room)
  }

  checkRoomOwner(uid: string): string {
    for (let index = 0; index < Object.keys(this.rooms).length; index++) {
      const room = Object.keys(this.rooms)[index];
      if (this.rooms[room].id === uid) {
        return room
      }
    }
    return ''
  }

  checkRoomOwnerByName(uid: string, room: string): boolean {
    for (let index = 0; index < Object.keys(this.rooms).length; index++) {
      const currRoom = Object.keys(this.rooms)[index];
      if (currRoom === room && this.rooms[room].id === uid) {
        return true
      }
    }
    return false
  }

  formatRooms(): roomFormatter[] {
    return Object.keys(this.rooms).map((room) => {
      return {
        room,
        online: this.rooms[room].online
      }
    })
  }

  // 将注册好的插件返回给客户端
  broadcastRoomsToClient() {
    try {
      this.io.emit(SERVER_EMIT_EVENTS.LIST_ROOMS, this.formatRooms())
    } catch (error) {
      console.error(error)
    }
  }

  // 广播传输图片
  broadcastTransferImage(room: string, filepath: string) {
    // 读取文件
    const fileBuffer = readFileSync(filepath)
    this.io.to(room).emit(SERVER_EMIT_EVENTS.SEND_IMAGE, fileBuffer)
  }
}

export {
  getUuid,
  SocketServer,
}