import { Socket } from "socket.io"
import { SOCKET_EVENTS, SERVER_EMIT_EVENTS, CLIENT_EMIT_EVENTS } from "../shared/events"

type EmptyFunction = () => void
type BaseSocketFunction = (socket: ServerSocket) => void
type BaseIdRoomFunction = (options: { id: string, room: string }) => void
type ThrowMsgFunction = (params: SocketThrowMsg) => void
type ListRoomFunction = (rooms: string[]) => void
type RoomNameFunction = (roomName: string) => void
type FileFunction = (options: SocketFileOptions) => void

export type SocketThrowMsg = {
  msg: string
}

export interface SocketFileOptions {
  buffer: Buffer,
  fileFormat: string
}

export type ServerSocket = Socket<ServerOnEvents, ServerEmitEvents, InterServerEvents, SocketData>

export interface ServerOnEvents {
  [SOCKET_EVENTS.CONNECTION]: BaseSocketFunction
  [SOCKET_EVENTS.DISCONNECTION]: EmptyFunction
  [CLIENT_EMIT_EVENTS.SEND_IMAGE]: FileFunction
  [CLIENT_EMIT_EVENTS.CREATE_ROOM]: BaseIdRoomFunction
  [CLIENT_EMIT_EVENTS.JOIN_ROOM]: BaseIdRoomFunction
  [CLIENT_EMIT_EVENTS.OUT_ROOM]: BaseIdRoomFunction
}

export interface ServerEmitEvents {
  [SERVER_EMIT_EVENTS.CREATED_ROOM]: RoomNameFunction
  [SERVER_EMIT_EVENTS.CREATED_ROOM_FAIL]: ThrowMsgFunction
  [SERVER_EMIT_EVENTS.SEND_IMAGE]: FileFunction
  [SERVER_EMIT_EVENTS.GET_IMAGE_FAIL]: ThrowMsgFunction
  [SERVER_EMIT_EVENTS.LIST_ROOMS]: ListRoomFunction
  [SERVER_EMIT_EVENTS.OUT_ROOM]: ThrowMsgFunction
  [SERVER_EMIT_EVENTS.JOINED_ROOM]: RoomNameFunction
  [SERVER_EMIT_EVENTS.JOIN_ROOM_FAIL]: ThrowMsgFunction
}
export interface SocketData {}
export interface InterServerEvents {}

export interface ClientOnEvents {
  [SOCKET_EVENTS.CLIENT_CONNECTION]: EmptyFunction
  [SOCKET_EVENTS.DISCONNECTION]: EmptyFunction
  [SERVER_EMIT_EVENTS.SEND_IMAGE]: FileFunction
  [SERVER_EMIT_EVENTS.GET_IMAGE_FAIL]: ThrowMsgFunction
  [SERVER_EMIT_EVENTS.OUT_ROOM]: ThrowMsgFunction
  [SERVER_EMIT_EVENTS.LIST_ROOMS]: ListRoomFunction
  [SERVER_EMIT_EVENTS.CREATED_ROOM]: RoomNameFunction
  [SERVER_EMIT_EVENTS.CREATED_ROOM_FAIL]: ThrowMsgFunction
  [SERVER_EMIT_EVENTS.JOINED_ROOM]: RoomNameFunction
  [SERVER_EMIT_EVENTS.JOIN_ROOM_FAIL]: ThrowMsgFunction
}
export interface ClientEmitEvents {
  [CLIENT_EMIT_EVENTS.CREATE_ROOM]: BaseIdRoomFunction
  [CLIENT_EMIT_EVENTS.JOIN_ROOM]: BaseIdRoomFunction
  [CLIENT_EMIT_EVENTS.SEND_IMAGE]: FileFunction
  [CLIENT_EMIT_EVENTS.OUT_ROOM]: BaseIdRoomFunction
}

export type SocketId = string

export type SocketFrom = 'device' | 'plugin'

export type SocketFirstReqQuery = {
  socketFrom: SocketFrom,
  id: string
}

type SocketClientBaseOptions = {
  id: string,
  url: string
  getRoomsFn?: ListRoomFunction
  joinRoomSuccess?: RoomNameFunction
  joinedRoomFailure?: ThrowMsgFunction
  clientConnectedFn?: EmptyFunction
  clientDisconnectedFn?: EmptyFunction
}
type SocketClientExtractOptions = {
  socketFrom: Extract<SocketFrom, 'plugin'>
  roomName: string
  getServerImgFn?: FileFunction
  createRoomSuccess?: RoomNameFunction
  createRoomFailure?: ThrowMsgFunction
} | {
  socketFrom: Extract<SocketFrom, 'device'>
  roomName?: string
}
export type SocketClientOptions = SocketClientBaseOptions & SocketClientExtractOptions