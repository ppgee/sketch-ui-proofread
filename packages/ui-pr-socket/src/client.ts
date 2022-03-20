import { io, Socket } from 'socket.io-client'
import getUuid from './shared/uuid'
import { SOCKET_EVENTS, SERVER_EMIT_EVENTS, CLIENT_EMIT_EVENTS } from './shared/events'
import { ClientOnEvents, ClientEmitEvents, SocketClientOptions, SocketFileOptions, roomFormatter } from './types/socket'
import { printLog } from './shared/utils'

class SocketClient {
  io: Socket<ClientOnEvents, ClientEmitEvents>

  constructor(options: SocketClientOptions) {
    const { url, socketFrom, id } = options
    this.io = io(`${url}`, {
      reconnectionDelayMax: 10000,
      query: {
        id,
        socketFrom,
      },
    })

    this.initSocket(options)
  }

  // 初始化socket client
  initSocket(options: SocketClientOptions) {
    const { socketFrom } = options

    switch (socketFrom) {
      case 'device':
        this.initDeviceSocket(options)
        break;
      case 'plugin':
        this.initPluginSocket(options)
        break;
      default:
        break;
    }

    this.io.on(SOCKET_EVENTS.CLIENT_CONNECTION, () => {
      const { clientConnectedFn } = options
      // console.log(`${this.io.id} connected!`)
      printLog('已连接服务器')
      clientConnectedFn && clientConnectedFn()
    })

    this.io.on(SERVER_EMIT_EVENTS.JOINED_ROOM, (room) => {
      printLog('加入房间成功')
      options.joinRoomSuccess && options.joinRoomSuccess(room)
    })

    this.io.on(SERVER_EMIT_EVENTS.JOIN_ROOM_FAIL, (params) => {
      printLog('加入房间失败')
      options.joinedRoomFailure && options.joinedRoomFailure(params)
    })

    this.io.on(SERVER_EMIT_EVENTS.OUTED_ROOM, (params) => {
      printLog('退出房间成功')
      options.outRoomSuccess && options.outRoomSuccess(params)
    })

    this.io.on(SERVER_EMIT_EVENTS.OUT_ROOM_FAIL, (params) => {
      printLog('退出房间失败')
      options.outRoomFailure && options.outRoomFailure(params)
    })

    this.io.on(SOCKET_EVENTS.DISCONNECTION, () => {
      const { clientDisconnectedFn } = options
      // console.log(`${this.io.id} disconnected`)
      printLog('失去连接')
      clientDisconnectedFn && clientDisconnectedFn()
    })
  }
  initDeviceSocket(options: SocketClientOptions) {
    const { getRoomsFn, sendImageFail } = options
    this.io.on(SERVER_EMIT_EVENTS.LIST_ROOMS, (rooms) => {
      printLog('获取房间', rooms.join(','))
      getRoomsFn && getRoomsFn(rooms)
    })
    this.io.on(SERVER_EMIT_EVENTS.GET_IMAGE_FAIL, (params) => {
      printLog('【传图端】获取不到插件')
      sendImageFail && sendImageFail(params)
    })
  }
  initPluginSocket(options: SocketClientOptions) {
    if (!options.roomName || !(options.socketFrom === 'plugin')) {
      return
    }
    this.io.on(SERVER_EMIT_EVENTS.CREATED_ROOM, (room) => {
      // console.log(`${this.io.id} create room success`)
      printLog('创建房间成功', room)
      options.createRoomSuccess && options.createRoomSuccess(room)
    })
    this.io.on(SERVER_EMIT_EVENTS.CREATED_ROOM_FAIL, (params) => {
      printLog('创建房间失败', params)
      options.createRoomFailure && options.createRoomFailure(params)
    })
    this.io.on(SERVER_EMIT_EVENTS.SEND_IMAGE, (params) => {
      // console.log(`${this.io.id} got image`)
      printLog('接收图片', params)
      options.getServerImgFn && options.getServerImgFn(params)
    })
  }

  uploadImage(options: SocketFileOptions) {
    printLog('客户端提交发送图片')
    this.io.emit(CLIENT_EMIT_EVENTS.SEND_IMAGE, options)
  }

  createRoom(options: { id: string, room: string }) {
    printLog('客户端提交创建房间')
    this.io.emit(CLIENT_EMIT_EVENTS.CREATE_ROOM, options)
  }

  joinRoom(option: { id: string, room: string }) {
    printLog('客户端提交加入房间')
    this.io.emit(CLIENT_EMIT_EVENTS.JOIN_ROOM, option)
  }

  pullRooms() {
    printLog('客户端提交拉取房间')
    this.io.emit(CLIENT_EMIT_EVENTS.PULL_ROOMS)
  }

  outRoom(option: { id: string, room: string }) {
    printLog('客户端提交退出房间')
    this.io.emit(CLIENT_EMIT_EVENTS.OUT_ROOM, option)
  }
}

export {
  getUuid,
  SocketClient
}