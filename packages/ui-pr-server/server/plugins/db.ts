import { join } from 'path'
import LowDB from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'

type RoomList = {
  [key: string]: {
    id: string,
    online: boolean
    socketId: string
  }
}

// db路径
function dbPath() {
  return join(process.cwd(), 'db.json')
}

export const DB_KEY = {
  ROOMS: 'rooms'
}



const adapter = new FileSync<{ rooms: RoomList }>(dbPath())
const db = LowDB(adapter)
db.defaults({ rooms: {} }).write()

export default db