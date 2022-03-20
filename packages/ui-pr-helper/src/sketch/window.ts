import { UI } from "sketch"
import BrowserWindow from "sketch-module-web-view"
import { Document } from "sketch/dom"
import { SKETCH_EVENT } from "../bridge/event"
import { getWebviewUrl } from "../bridge/window"
import { getSelectedPage, initImageLayer } from "./dom"

const getUuid = (a: string = ''): string => (
  a ? ((Number(a) ^ Math.random() * 16) >> Number(a) / 4).toString(16)
    : (`${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`).replace(/[018]/g, getUuid)
);

let helpWindowList: HelpWindow[] = []

export class HelpWindow {
  browserWindow: BrowserWindow
  windowIdentifier: string

  constructor() {
    this.windowIdentifier = `${__IDENTIFIER__}${getUuid()}.webview`

    this.browserWindow = new BrowserWindow({
      alwaysOnTop: true,
      identifier: this.windowIdentifier,
      width: __IPHONE6_WIDTH__,
      height: __IPHONE6_HEIGHT__,
    })

    this.init()

    helpWindowList.push(this)
  }

  // 添加图片层到页面
  pushImageToPage(imageUrl: string, imgScale: number) {
    try {
      const selectedPage = getSelectedPage()
      const imageLayer = initImageLayer({
        imageUrl,
        imgScale,
        selectedPage,
        style: {
          opacity: .7
        }
      })
      selectedPage.layers.push(imageLayer)
    } catch (error) {
      console.log('【添加图片失败】')
      console.error(error)
    }

    this.pushMessage('已加载图片')
  }

  // 打印消息
  pushMessage(text: string, document?: Document | undefined) {
    if (document) {
      UI.message(text, document)
      return
    }
    UI.message(text)
  }

  destroy() {
    this.browserWindow && this.browserWindow.close()
    this.browserWindow && this.browserWindow.destroy()
  }

  private init() {
    const webContents = this.browserWindow.webContents

    // print a message web the page loads
    // @ts-ignore
    webContents.on(SKETCH_EVENT.WEBVIEW_DID_LOAD, () => {
      this.pushMessage('插件加载成功')
    })

    // @ts-ignore
    webContents.on(SKETCH_EVENT.CLIENT_SEND_IMAGE, (...args) => {
      const [imageBase64, imgScale] = args
      this.pushMessage(`插件接收到图片`)
      this.pushImageToPage(imageBase64, imgScale)
    })

    // @ts-ignore
    webContents.on(SKETCH_EVENT.CLIENT_LOG, (...arg) => {
      console.log(arg.join(','))
      // this.pushMessage(arg.join(','))
    })

    this.browserWindow.loadURL(getWebviewUrl())
  }
}

// When the plugin is shutdown by Sketch (for example when the user disable the plugin)
// we need to close the webview if it's open
export function shutdownWindows() {
  if (!helpWindowList.length) {
    return
  }

  for (let index = 0; index < helpWindowList.length; index++) {
    const helpWindow = helpWindowList[index];
    helpWindow && helpWindow.destroy()
  }
  helpWindowList = []
}