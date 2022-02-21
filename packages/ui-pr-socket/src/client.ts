import { io, Socket } from 'socket.io-client'
import getUuid from './shared/uuid'
import { SOCKET_EVENT } from './shared/events'
import { CServerToClientEvents, CClientToServerEvents, SocketClientOptions, SocketFileOptions } from './types/socket'

class SocketClient {
  io: Socket<CServerToClientEvents, CClientToServerEvents>

  constructor(options: SocketClientOptions) {
    const { url, socketFrom } = options
    this.io = io(`${url}?socketFrom=${socketFrom}`)

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

    this.io.on(SOCKET_EVENT.CLIENT_CONNECTION, () => {
      const { clientConnectedFn } = options
      console.log(`${this.io.id} connected!`)
      clientConnectedFn && clientConnectedFn()
    })

    this.io.on(SOCKET_EVENT.DISCONNECTION, () => {
      const { clientDisconnectedFn } = options
      console.log(`${this.io.id} disconnected`)
      clientDisconnectedFn && clientDisconnectedFn()
    })
  }
  initDeviceSocket(options: SocketClientOptions) {
    const { getRoomsFn } = options
    this.io.on(SOCKET_EVENT.CLIENT_GET_ROOMS, (rooms) => {
      getRoomsFn && getRoomsFn(rooms)
    })
  }
  initPluginSocket(options: SocketClientOptions) {
    if (!options.roomName) {
      return
    }
    this.io.on(SOCKET_EVENT.PLUGIN_REGISTER_SUCCESS, (roomName) => {
      console.log(`${this.io.id} create room success`)
      options.joinedRoomFn && options.joinedRoomFn(roomName)
    })
    this.io.on(SOCKET_EVENT.SERVER_SEND_IMAGE, (params) => {
      console.log(`${this.io.id} got image`)
      options.getRoomImgFn && options.getRoomImgFn(params)
    })
  }

  uploadImage(options: SocketFileOptions) {
    this.io.emit(SOCKET_EVENT.UPLOAD_IMAGE, options)
  }

  createRoom(options: { id: string, room: string }) {
    this.io.emit(SOCKET_EVENT.PLUGIN_REGISTER, options)
  }

}

export {
  getUuid,
  SocketClient
}