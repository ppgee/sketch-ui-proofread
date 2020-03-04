import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
import sketch from 'sketch'
import UI from 'sketch/ui'

const webviewIdentifier = 'zk-ui-helper.webview'

// sketch 通信事件
const SKETCH_EVENT = {
  CLIENT_SEND_IMAGE: 'client-send-image',
  CLIENT_LOG: 'client-log'
}

export default function () {
  const options = {
    identifier: webviewIdentifier,
    width: 375,
    height: 667,
    show: false
  }

  const browserWindow = new BrowserWindow(options)

  // only show the window when the page has loaded to avoid a white flash
  browserWindow.once('ready-to-show', () => {
    browserWindow.show()
  })

  const webContents = browserWindow.webContents

  // print a message when the page loads
  webContents.on('did-finish-load', () => {
    UI.message('UI loaded!')
  })

  // add a handler for a call from web content's javascript
  webContents.on(SKETCH_EVENT.CLIENT_SEND_IMAGE, (imageUrl, imgScale) => {
    try {
      console.log('-插件接收到新的图片-')
      let Image = sketch.Image
      let Rectangle = sketch.Rectangle

      const selectedPage = sketch.getSelectedDocument().selectedPage


      // 初始图片大小（依据iphone6尺寸）
      let originalImgFrame = {
        x: 0,
        y: 0,
        width: 375,
        height: 375 / imgScale
      }

      // 找出首个图片的位置，然后获取尺寸
      for (let index = 0; index < selectedPage.layers.length; index++) {
        const layer = selectedPage.layers[index]
        if (layer.type === 'Image') {
          originalImgFrame = Object.assign(originalImgFrame, layer.frame, {
            height: layer.frame.width / imgScale
          })
          break
        }
      }

      // 创建图片base64
      let imageData = NSData.alloc().initWithBase64EncodedString_options(imageUrl, NSDataBase64DecodingIgnoreUnknownCharacters)
      let image = NSImage.alloc().initWithData(imageData)

      const imageLayer = new Image({
        image,
        frame: new Rectangle(originalImgFrame.x, originalImgFrame.y, originalImgFrame.width, originalImgFrame.height),
        parent: selectedPage
      })

      UI.message('已加载图片')
      // webContents
      //   .executeJavaScript(`setRandomNumber(${Math.random()})`)
      //   .catch(console.error)
    } catch (error) {
      console.error(error)
    }
  })

  webContents.on(SKETCH_EVENT.CLIENT_LOG, msg => {
    UI.message(msg)
  })

  browserWindow.loadURL(require('../resources/webview.html'))
}

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function onShutdown() {
  const existingWebview = getWebview(webviewIdentifier)
  if (existingWebview) {
    existingWebview.close()
  }
}
