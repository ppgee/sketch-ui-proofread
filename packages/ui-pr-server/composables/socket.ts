// import {} from 'vue'
import { SocketClient } from 'ui-pr-socket/client'

type roomFormatter = {
  room: string,
  online: boolean
}

const getUuid = (a: string = ''): string => (
  a ? ((Number(a) ^ Math.random() * 16) >> Number(a) / 4).toString(16)
    : (`${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`).replace(/[018]/g, getUuid)
);

const SOCKET_INFO_KEY = 'socket-info'

let socketClient: SocketClient

export type SocketInfo = {
  id: string
  room: string
}

export default function useSocket() {
  // 本地存储的socket信息
  let storeSocketInfo = reactive(createSocketInfo())
  let socketLoading = ref<'pending' | 'resolved'>('resolved')
  let rooms = ref<Array<roomFormatter>>([])

  function createSocketInfo(): SocketInfo {
    return {
      id: getUuid(),
      room: ''
    }
  }

  function getInfoFromStore(): SocketInfo {
    let socketInfoStr = window.localStorage.getItem(SOCKET_INFO_KEY)
    return socketInfoStr ? JSON.parse(socketInfoStr) : storeSocketInfo
  }

  function getRooms(roomList: Array<roomFormatter>) {
    console.log('接收到插件列表', roomList.join(','))
    rooms.value = roomList
  }

  function updateSocketInfo<K extends keyof SocketInfo, T extends SocketInfo[K]>(infoKey: K, value: T) {
    storeSocketInfo[infoKey] = value
  }

  onMounted(() => {
    // 挂载时加载
    storeSocketInfo = getInfoFromStore()
    if (socketClient) {
      socketClient.pullRooms()
      return
    }

    const { id } = toRaw(storeSocketInfo)
    socketLoading.value = 'pending'
    console.log(`id: ${id} 准备连接 socket`)
    socketClient = new SocketClient({
      id,
      url: window.location.origin,
      socketFrom: 'device',
      getRoomsFn: getRooms
    })
  })
  
  onBeforeUnmount(() => {
    if (!socketClient) return
    console.log('客户端主动下线')
    socketClient.io.disconnect()
  })

  return {
    storeSocketInfo,
    socketLoading,
    rooms,
    updateSocketInfo,
  }
}