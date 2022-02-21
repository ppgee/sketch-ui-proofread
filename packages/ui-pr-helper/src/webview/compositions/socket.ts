import { ref } from 'vue'
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
  // 本地储存的socket信息
  let storeSocketInfo = reactive(getInfoFromStore())
  let socketLoading = ref<'pending' | 'resolved'>('resolved')
  let isJoined = ref<boolean>(false)

  function getInfoFromStore(): SocketInfo {
    let socketInfoStr = window.localStorage.getItem(SOCKET_INFO_KEY)
    return socketInfoStr ? JSON.parse(socketInfoStr) : createSocketInfo()
  }
  function updateInfoFromStore() {
    window.localStorage.setItem(SOCKET_INFO_KEY, JSON.stringify(storeSocketInfo))
    if (socketLoading.value === 'pending') {
      socketLoading.value = 'resolved'
    }
    isJoined.value = true
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

    socketLoading.value = 'pending'
    // 更新id
    storeSocketInfo.id = getUuid()
    console.log('storeSocketInfo.id', storeSocketInfo.id)

    socketClient = new SocketClient({
      id: storeSocketInfo.id,
      url: server,
      socketFrom: 'plugin',
      roomName: room,
      clientConnectedFn: () => socketClient.createRoom({ id: storeSocketInfo.id, room }),
      createRoomSuccess: updateInfoFromStore,
      joinRoomSuccess: updateInfoFromStore,
      // joinedRoomFn
    })
  }

  return {
    isJoined,
    socketLoading,
    storeSocketInfo,
    updateSocketInfo,
    createSocketConnection
  }
}