import { ref, reactive, toRaw } from 'vue'
import { getUuid, SocketClient } from 'ui-pr-socket/client'
import { SKETCH_EVENT } from '../bridge/event';
import { arrayBufferToBase64, arrayBufferToImgUrl, dateFormatter, getImgScale, validateHTTP } from '../utils';

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

  // 已收到的图片列表
  let imgList = ref<{ url: string, time: string }[]>([])

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

  function printMsg(params: { msg: string; }) {
    console.log(params.msg)
  }

  async function getServerImg(buffer: ArrayBuffer) {
    try {
      updateImgList(buffer)
      // 结束时将字节数组转化成图片
      const imageBase64 = arrayBufferToBase64(buffer)
      const imgScale = await getImgScale(`data:;base64,${imageBase64}`)
      console.log('【准备发送图片到插件】', imgScale)
      // @ts-ignore
      window.postMessage(SKETCH_EVENT.CLIENT_SEND_IMAGE, imageBase64, imgScale)
    } catch (error) {
      console.error(error)
    }
  }

  function updateImgList(buffer: ArrayBuffer) {
    const imgUrl = arrayBufferToImgUrl(buffer)
    imgList.value.unshift({
      url: imgUrl,
      time: dateFormatter(new Date())
    })
  }

  function clearImgList() {
    imgList.value = []
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
      joinedRoomFailure: printMsg,
      sendImageFail: printMsg,
      getServerImgFn: getServerImg
      // joinedRoomFn
    })
  }

  onBeforeUnmount(() => {
    console.log('客户端主动下线')
    socketClient.io.disconnect()
  })

  return {
    isJoined,
    socketLoading,
    storeSocketInfo,
    imgList,
    clearImgList,
    updateSocketInfo,
    createSocketConnection
  }
}