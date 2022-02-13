// // disable the context menu (eg. the right click menu) to have a more native feel
// document.addEventListener('contextmenu', (e) => {
//   e.preventDefault()
// })

// // call the plugin from the webview
// document.getElementById('button').addEventListener('click', () => {
//   window.postMessage('nativeLog', 'Called from the webview')
// })

// // call the wevbiew from the plugin
// window.setRandomNumber = (randomNumber) => {
//   document.getElementById('answer').innerHTML = `'Random number from the plugin: '${randomNumber} test ${test}`
// }

// 本地存储
const NAME_STORAGE_KEY = 'penguin-alias'

// socket ip
const SOCKET_IP_ADDRESS = 'http://192.168.2.129:3000'

// socket 事件
const SOCKETIO_EVENT = {
  DISCONNECTION: 'disconnect',
  CONNECTION: 'connect',
  REGISTER_CLIENT: 'register-client',
  REGISTER_CLIENT_SUCCESS: 'register-client-success',
  REGISTER_PENGUIN: 'register-penguin',
  REGISTER_PENGUIN_SUCCESS: 'register-penguin-success',
  UPLOAD_IMAGE: 'upload-image',
  GET_CONNECTED_PENGUIN: 'get-connected-penguin',
  SERVER_SEND_IMAGE: 'server-send-image',
  RENAME_PENGUIN: 'rename-penguin',
  RENAME_PENGUIN_SUCCESS: 'rename-penguin-success',
  RENAME_PENGUIN_FAILURE: 'rename-penguin-failure'
}

// sketch 通信事件
const SKETCH_EVENT = {
  CLIENT_SEND_IMAGE: 'client-send-image',
  CLIENT_LOG: 'client-log'
}

// 获取图片比例
function getImgScale(imgUrl) {
  return new Promise(resolve => {
    // 创建对象
    var img = new Image()
    // 改变图片的src
    img.src = imgUrl
    // 判断是否有缓存
    if (img.complete) {
      resolve(img.width / img.height)
    } else {
      // 加载完成执行
      img.onload = function () {
        resolve(img.width / img.height)
      }
    }
  })
}

function sendMsg(msg) {
  // 与sketch通信
  window.postMessage(SKETCH_EVENT.CLIENT_LOG, msg)
}

let Socket = null

const app = new Vue({
  el: '#app',
  data() {
    return {
      editMode: false, // 编辑状态
      imgUrl: '',
      penguinName: 'sketch-user'
    }
  },
  methods: {
    // 保存名称
    savePenguinName() {
      const newPenguinName = this.$refs.nameInput.currentValue

      // 发送重命名事件
      Socket.emit(SOCKETIO_EVENT.RENAME_PENGUIN, newPenguinName, this.penguinName)
    },
    // 取消编辑
    cancelEdit() {
      this.$refs.nameInput.currentValue = this.penguinName
      this.toggleEdit(false)
    },
    toggleEdit(editMode) {
      this.editMode = editMode
    },
    // 获取插件名称
    getPenguinName() {
      this.penguinName = localStorage.getItem(NAME_STORAGE_KEY) || `sketch-user-${Math.round((Math.random() * 1000))}`
    },
    // 保存插件名称
    savePenguinNameToStorage(penguinName) {
      this.penguinName = penguinName
      localStorage.setItem(NAME_STORAGE_KEY, this.penguinName)
    }
  },
  mounted() {
    // Socket = io('http://192.168.2.149:3000?type=penguin&alias=sketch-penguin')
    // Socket = io('http://192.168.3.224:3000?type=penguin&alias=sketch-penguin')
    // Socket = io('http://192.168.2.5:3000?type=penguin&alias=sketch-penguin')
    // Socket = io('http://192.168.3.3:3000?type=penguin&alias=sketch-penguin')
    Socket = io(SOCKET_IP_ADDRESS + '?type=penguin&alias=sketch-penguin')

    // 连接成功的事件
    Socket.on(SOCKETIO_EVENT.CONNECTION, () => {
      console.log('连接成功')
      sendMsg('连接成功')

      // 获取插件名称
      this.getPenguinName()

      Socket.emit(SOCKETIO_EVENT.REGISTER_PENGUIN, this.penguinName)
    })

    // 注册成功事件
    Socket.on(SOCKETIO_EVENT.REGISTER_PENGUIN_SUCCESS, (penguinName) => {
      console.log('注册成功')
      // 保存插件名称到本地存储中
      this.savePenguinNameToStorage(penguinName)
      sendMsg('注册成功')
    })

    ss(Socket).on(SOCKETIO_EVENT.SERVER_SEND_IMAGE, function (stream, data) {
      try {
        console.log('开始接收图片')
        sendMsg('收到新图片，开始接收图片...')
        // 整个图片的字节数组
        let arrayBuffer = []
        stream.on('data', function (streamData) {
          // 补充字节数组
          arrayBuffer.push(streamData)
        });
        stream.on('end', function () {
          // 结束时将字节数组转化成图片
          const blob = new Blob(arrayBuffer)

          let fileReader = new FileReader()
          fileReader.readAsDataURL(blob)
          fileReader.onload = function (e) {
            console.log(e)
            // urlData就是对应的文件内容
            app.imgUrl = this.result
            // 与sketch通信
            getImgScale(this.result)
              .then(imgScale => {
                const imgUrl = this.result
                window.postMessage(SKETCH_EVENT.CLIENT_SEND_IMAGE, imgUrl.replace('data:;base64,', ''), imgScale)
              })
          }
        })
      } catch (error) {
        console.error(error)
      }
    })

    // 重命名成功
    Socket.on(SOCKETIO_EVENT.RENAME_PENGUIN_SUCCESS, (penguinName) => {
      console.log('重命名成功')
      // 保存插件名称到本地存储中
      this.savePenguinNameToStorage(penguinName)
      this.toggleEdit(false)
      sendMsg('重命名成功')
    })

    // 重命名失败
    Socket.on(SOCKETIO_EVENT.RENAME_PENGUIN_FAILURE, (msg) => {
      sendMsg(msg)
    })

    Socket.on(SOCKETIO_EVENT.DISCONNECTION, () => {
      console.log('断开连接')
      sendMsg('断开连接')
    })
  }
})
