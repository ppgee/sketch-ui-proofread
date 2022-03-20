import { Server } from 'http'
import { SocketServer } from 'ui-pr-socket/server'
import db, { DB_KEY } from './db'

type RoomList = {
  [key: string]: {
    id: string,
    online: boolean
    socketId: string
  }
}

async function updateRoomsToDB(params: { action: 'add' | 'remove' | 'update', key: keyof RoomList, value?: RoomList[keyof RoomList] }): Promise<RoomList> {
  try {
    db.read()

    const { action, key, value } = params
    const rowKey = `${DB_KEY.ROOMS}.${key}`
    if (action === 'add' && value) {
      db.set(rowKey, value).write()
    } else if (action === 'remove') {
      db.unset(rowKey).write()
    } else if (action === 'update' && value) {
      db.set(rowKey, value).write()
    }

    return db.get(DB_KEY.ROOMS).cloneDeep().value()
  } catch (error) {
    throw error
  }
}

async function readRoomsToServer(): Promise<RoomList> {
  try {
    db.read()
    return db.get(DB_KEY.ROOMS).cloneDeep().value()
  } catch (error) {
    throw error
  }
}

export async function createSocketServer(server: Server) {
  try {
    const rooms = await readRoomsToServer()
    return new SocketServer(server, {
      rooms,
      updateRoomsToDB
    })
  } catch (error) {
    console.error(error)
  }
}
