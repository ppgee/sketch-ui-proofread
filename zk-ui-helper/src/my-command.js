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

function getArtboardFrame(selectedPage, imgScale) {
  // 初始图片大小（依据iphone6尺寸）
  let originalImgFrame = {
    x: 0,
    y: 0,
    width: 375,
    height: 375 / imgScale
  }

  // 首个画板的架构
  let firstLayerFrame = null
  // 已选择的画板架构
  let selectedLayerFrame = null

  // 找出首个图片的位置，然后获取尺寸
  for (let index = 0; index < selectedPage.layers.length; index++) {
    const layer = selectedPage.layers[index]
    if (layer.type !== 'Image' && layer.type !== 'Artboard') continue

    // 如果没有首个画板架构，则填充
    if (firstLayerFrame === null) {
      firstLayerFrame = layer.frame
    }

    // 如果没有已选择的画板架构，则填充
    if (selectedLayerFrame === null && layer.selected) {
      selectedLayerFrame = layer.frame
    }

    // 如果都有数据，直接跳出，没必要循环
    if (firstLayerFrame && selectedLayerFrame) {
      break
    }
  }

  // 优先已选择的画板
  if (selectedLayerFrame) {
    return Object.assign(originalImgFrame, selectedLayerFrame, {
      height: selectedLayerFrame.width / imgScale
    })
  } else if (firstLayerFrame) { // 其次是首个画板
    return Object.assign(originalImgFrame, firstLayerFrame, {
      height: firstLayerFrame.width / imgScale
    })
  }

  // 如果没有直接输入原始框架
  return originalImgFrame
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
    // console.log('-插件接收到新的图片-')
    try {
      let Image = sketch.Image
      let Rectangle = sketch.Rectangle

      // 创建图片base64
      let imageData = NSData.alloc().initWithBase64EncodedString_options(imageUrl, NSDataBase64DecodingIgnoreUnknownCharacters)
      let image = NSImage.alloc().initWithData(imageData)

      // 已选择的页面
      const selectedPage = sketch.getSelectedDocument().selectedPage
      // 获取画板尺寸
      const originalImgFrame = getArtboardFrame(selectedPage, imgScale)
      const imageLayer = new Image({
        image,
        frame: new Rectangle(originalImgFrame.x, originalImgFrame.y, originalImgFrame.width, originalImgFrame.height),
        parent: selectedPage
      })
    } catch (error) {
      console.error(error)
    }

    UI.message('已加载图片')
    // webContents
    //   .executeJavaScript(`setRandomNumber(${Math.random()})`)
    //   .catch(console.error)
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
