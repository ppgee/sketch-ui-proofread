import { ref, reactive, toRaw } from 'vue'
import { SocketClient } from 'ui-pr-socket/client'

const getUuid = (a: string = ''): string => (
  a ? ((Number(a) ^ Math.random() * 16) >> Number(a) / 4).toString(16)
    : (`${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`).replace(/[018]/g, getUuid)
);

function validateHTTP(str: string) {
  return str.indexOf("http://") == 0 || str.indexOf("https://") == 0
}

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
      url: validateHTTP(server) ? server : `http://${server}`,
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