import { defineNuxtPlugin } from '#app'
import { SocketServer } from 'ui-pr-socket/dist/ui-pr-socket-server'
import { writeFileSync } from 'fs'
import { join } from 'path'

// 图片路径
function imgTempPath() {
  return join(__dirname, `/temp/images`)
}

async function saveToImage(params: any) {
  // 文件路径
  const filepath = `${imgTempPath()}/${new Date().valueOf()}.${params.fileFormat}`
  writeFileSync(filepath, params.buffer)

  return filepath
}

export default defineNuxtPlugin(({ ssrContext }) => {
  const {
    // @ts-expect-error: Missing server property in socket
    req: {
      socket: { server }
    }
  } = ssrContext
  const socketServer = new SocketServer(server, {
    saveToImageFn: saveToImage
  })
})