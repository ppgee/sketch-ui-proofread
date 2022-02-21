import { SocketClient } from 'ui-pr-socket/client'
import getUuid from "../../utils/uuid"

const SOCKET_INFO_KEY = 'socket-info'

let socketClient: SocketClient

export type SocketInfo = {
  id: string,
  room: string,
  server: string
}

export default function useSocket() {
  function getInfoFromStore(): SocketInfo {
    let socketInfoStr = window.localStorage.getItem(SOCKET_INFO_KEY)
    return socketInfoStr ? JSON.parse(socketInfoStr) : createSocketInfo()
  }
  function updateInfoFromStore(socketInfo: SocketInfo) {
    window.localStorage.setItem(SOCKET_INFO_KEY, JSON.stringify(socketInfo))
  }

  function createSocketInfo(): SocketInfo {
    return {
      id: '',
      room: '',
      server: ''
    }
  }

  function updateSocketInfo<K extends keyof SocketInfo, T extends SocketInfo[K]>(infoKey: K, value: T) {
    storeSocketInfo[infoKey] = value
  }

  function createSocketConnection() {
    if (socketClient) return

    const { room, server } = toRaw(storeSocketInfo)
    socketClient = new SocketClient({
      id: getUuid(`${room}${new Date().valueOf()}${Math.random() * 1000}`),
      url: server,
      socketFrom: 'plugin',
      roomName: room
    })
  }

  // 本地储存的socket信息
  let storeSocketInfo = reactive(getInfoFromStore())
  return {
    storeSocketInfo,
    updateSocketInfo,
    createSocketConnection
  }
}