import { defineNuxtPlugin } from '#app'
import { SocketServer } from 'ui-pr-socket/server'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { Low, JSONFile } from 'lowdb'

type RoomList = {
  [key: string]: {
    id: string,
    online: boolean
  }
}

// 图片路径
function imgTempPath() {
  return join(process.cwd(), `/temp/images`)
}

// db路径
function dbPath() {
  return join(process.cwd(), 'db.json')
}
const adapter = new JSONFile<{ rooms: RoomList }>(dbPath())
const db = new Low(adapter)

async function saveToImage(params: any) {
  // 文件路径
  const filepath = `${imgTempPath()}/${new Date().valueOf()}.${params.fileFormat}`
  writeFileSync(filepath, params.buffer)

  return filepath
}

async function updateRoomsToDB(params: { action: 'add' | 'remove' | 'update', key: keyof RoomList, value?: RoomList[keyof RoomList] }): Promise<RoomList> {
  try {
    await db.read()
    db.data ||= { rooms: {} }

    const { action, key, value } = params
    if (action === 'add' && value) {
      db.data.rooms[key] = value
    } else if (action === 'remove') {
      delete db.data.rooms[key]
    } else if (action === 'update' && value) {
      db.data.rooms[key] = value
    }

    await db.write()
    return db.data.rooms
  } catch (error) {
    throw error
  }
}

async function readRoomsToServer(): Promise<RoomList> {
  try {
    await db.read()
    db.data ||= { rooms: {} }
    return db.data.rooms
  } catch (error) {
    throw error
  }
}

export default defineNuxtPlugin(async ({ ssrContext }) => {
  try {
    const {
      // @ts-expect-error: Missing server property in socket
      req: {
        socket: { server }
      }
    } = ssrContext

    const rooms = await readRoomsToServer()
    const socketServer = new SocketServer(server, {
      rooms,
      saveToImageFn: saveToImage,
      updateRoomsToDB,
    })
  } catch (error) {
    console.error('socket 中间件异常', error)
    throw error
  }
})