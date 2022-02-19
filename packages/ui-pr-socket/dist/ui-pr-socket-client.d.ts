import { Socket } from 'socket.io-client';

declare enum SOCKET_EVENT {
    SERVER_CONNECTION = "connection",
    CLIENT_CONNECTION = "connect",
    DISCONNECTION = "disconnect",
    UPLOAD_IMAGE = "upload-image",
    UPLOAD_IMAGE_FAILURE = "upload-image-failure",
    SERVER_SEND_IMAGE = "server-send-image",
    PLUGIN_REGISTER = "plugin-register",
    PLUGIN_REGISTER_SUCCESS = "plugin-register-success",
    PLUGIN_REGISTER_FAILURE = "plugin-register-failure",
    CLIENT_GET_ROOMS = "client-get-plugins",
    CLIENT_OUT_ROOM = "client-out-room"
}

interface SocketFileOptions {
  buffer: Buffer,
  fileFormat: string
}

interface CServerToClientEvents {
  [SOCKET_EVENT.CLIENT_CONNECTION]: () => void
  [SOCKET_EVENT.DISCONNECTION]: () => void
  [SOCKET_EVENT.CLIENT_GET_ROOMS]: (rooms: string[]) => void
  [SOCKET_EVENT.PLUGIN_REGISTER_SUCCESS]: (roomName: string) => void
  [SOCKET_EVENT.SERVER_SEND_IMAGE]: (options: SocketFileOptions) => void
}
interface CClientToServerEvents {
  [SOCKET_EVENT.PLUGIN_REGISTER]: (roomName: string) => void
  [SOCKET_EVENT.UPLOAD_IMAGE]: (options: SocketFileOptions) => void
}

type SocketFrom = 'device' | 'plugin'

type SocketClientOptions = {
  url: string
  socketFrom: SocketFrom
  roomName?: string
  getRoomsFn?: (rooms: string[]) => void
  getRoomImgFn?: (options: SocketFileOptions) => void
  joinedRoomFn?: (roomName: string) => void
}

declare class SocketClient {
    io: Socket<CServerToClientEvents, CClientToServerEvents>;
    constructor(options: SocketClientOptions);
    initSocket(options: SocketClientOptions): void;
    initDeviceSocket(options: SocketClientOptions): void;
    initPluginSocket(options: SocketClientOptions): void;
    uploadImage(options: SocketFileOptions): void;
    createRoom(roomName: string): void;
}

export { SocketClient };
