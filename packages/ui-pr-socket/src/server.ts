import { Server, Socket } from 'socket.io'
import { Server as HttpServer } from 'http'

import getUuid from './shared/uuid'
import { SOCKET_EVENTS, SERVER_EMIT_EVENTS, CLIENT_EMIT_EVENTS } from './shared/events'
import { ServerSocket, SocketFirstReqQuery, SocketFrom, RoomList, DBActionRoomFunction, roomFormatter } from './types/socket'


class SocketServer {
  io: Server
  rooms: RoomList
  updateRoomsToDB: DBActionRoomFunction

  constructor(server: HttpServer, options: { rooms: RoomList, updateRoomsToDB: DBActionRoomFunction }) {
    // 生成 io 实例
    this.io = new Server<ServerSocket>(server, {
      cors: {
        origin: '*'
      },
      maxHttpBufferSize: 1e8
    })
    this.rooms = options.rooms || {}
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
        socket.disconnect()
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
                socketId: socket.id,
                online: false
              }
            })
          } else {
            socket.leave(room)
          }

          socket.emit(SERVER_EMIT_EVENTS.OUTED_ROOM, { id, room })
        } catch (error) {
          socket.emit(SERVER_EMIT_EVENTS.OUT_ROOM_FAIL, { msg: `${error}` })
        }
      })

      // 客户端失去连接
      socket.on(SOCKET_EVENTS.DISCONNECTING, (reason) => {
        console.log(`${socketFrom}: ${id} 下线了`)
        console.log(`下线原因：${reason}`)

        this.logoutSocket({
          id,
          socketFrom,
          roomName: this.getRoomName(socket),
          socketId: socket.id
        })
      })

      console.log(`${socketFrom}: ${id} 加入 server 成功`)
    })
  }

  ///
  /// start
  /// 设备端socket方法
  ///

  // 初始化设备端socket
  initDeviceSocket(socket: ServerSocket): void {
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

      this.deviceJoinRoom(socket, room)
    })

    socket.on(CLIENT_EMIT_EVENTS.SEND_IMAGE, async (options) => {
      // 判断是否进入了对应的插件
      if (socket.rooms.size < 1) {
        console.log('找不到插件')
        socket.emit(SERVER_EMIT_EVENTS.GET_IMAGE_FAIL, { msg: '找不到插件！' })
        return
      }

      // console.log(this.getRoomName(socket))
      this.broadcastTransferImage(this.getRoomName(socket), options.buffer)
    })

    socket.on(CLIENT_EMIT_EVENTS.PULL_ROOMS, () => {
      socket.emit(SERVER_EMIT_EVENTS.LIST_ROOMS, this.formatRooms())
    })
  }

  deviceJoinRoom(socket: ServerSocket, room: string): void {
    if (this.hasMoreRoom(socket)) {
      socket.emit(SERVER_EMIT_EVENTS.JOIN_ROOM_FAIL, { msg: '已选定插件，暂不支持多插件！' })
      return
    }
    socket.join(room)
    socket.emit(SERVER_EMIT_EVENTS.JOINED_ROOM, room)
  }

  ///
  /// end
  /// 设备端socket方法
  ///

  ///
  /// start
  /// 插件端socket方法
  ///

  // 初始化插件端socket
  async initPluginSocket(socket: ServerSocket): Promise<void> {
    // 查看是否已经建立房间，如果是，直接加入房间即可
    try {
      const { id } = socket.handshake.query as SocketFirstReqQuery
      const room = this.checkRoomOwner(id)
      if (room.length !== 0 && !this.checkJoinedRoom(socket, room)) {
        this.pluginJoinRoom(socket, room)
        // 如果是插件端，需要更新房间状态
        this.rooms = await this.updateRoomsToDB({
          action: 'update',
          key: room,
          value: {
            id,
            socketId: socket.id,
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
          this.pluginJoinRoom(socket, room)
          this.rooms = await this.updateRoomsToDB({
            action: 'update',
            key: room,
            value: {
              id,
              socketId: socket.id,
              online: true
            }
          })
          this.broadcastRoomsToClient()
          return
        }

        this.pluginJoinRoom(socket, room)
        socket.emit(SERVER_EMIT_EVENTS.CREATED_ROOM, room)
        this.rooms = await this.updateRoomsToDB({
          action: 'add',
          key: room,
          value: {
            id,
            socketId: socket.id,
            online: true
          }
        })
        this.broadcastRoomsToClient()
      } catch (error) {
        socket.emit(SERVER_EMIT_EVENTS.CREATED_ROOM_FAIL, {
          msg: '服务器异常'
        })
      }
    })
  }

  pluginJoinRoom(socket: ServerSocket, room: string): void {
    if (this.checkJoinedRoom(socket, room)) {
      socket.emit(SERVER_EMIT_EVENTS.JOIN_ROOM_FAIL, { msg: '【插件端】已加入房间' })
      return
    }
    socket.join(room)
    socket.emit(SERVER_EMIT_EVENTS.JOINED_ROOM, room)
  }

  ///
  /// end
  /// 插件端socket方法
  ///

  ///
  /// start
  /// 公共方法
  ///
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
          socketId: '',
          online: false
        }
      })
      this.broadcastRoomsToClient()
    }
  }

  // 获取房间名
  getRoomName(socket: ServerSocket): string {
    const roomSet = socket.rooms.keys()

    let roomName = ''
    for (let value of roomSet) {
      roomName = value
    }
    console.log('找到房间名：', roomName)
    return roomName
  }

  hasMoreRoom(socket: ServerSocket): boolean {
    return socket.rooms.size >= 2
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
  async broadcastTransferImage(room: string, buffer: ArrayBuffer) {
    const socketId = this.rooms[room].socketId
    if (!socketId) {
      return
    }
    const socket = this.io.in(socketId)
    socket.emit(SERVER_EMIT_EVENTS.SEND_IMAGE, buffer)
  }
  ///
  /// end
  /// 公共方法
  ///
}

export {
  getUuid,
  SocketServer,
}