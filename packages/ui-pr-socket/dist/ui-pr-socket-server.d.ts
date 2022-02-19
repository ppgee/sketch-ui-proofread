import { Server, Socket } from 'socket.io';
import { Server as Server$1 } from 'http';

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

type SocketThrowMsg = {
  msg: string
}

interface SocketFileOptions {
  buffer: Buffer,
  fileFormat: string
}

interface SServerToClientEvents {
  [SOCKET_EVENT.UPLOAD_IMAGE]: (options: SocketFileOptions) => void
  [SOCKET_EVENT.PLUGIN_REGISTER]: (roomName: string) => void
}

interface SClientToServerEvents {
  [SOCKET_EVENT.CLIENT_GET_ROOMS]: (rooms: string[]) => void
  [SOCKET_EVENT.PLUGIN_REGISTER_SUCCESS]: (roomName: string) => void
  [SOCKET_EVENT.PLUGIN_REGISTER_FAILURE]: (params: SocketThrowMsg) => void
  [SOCKET_EVENT.UPLOAD_IMAGE_FAILURE]: (params: SocketThrowMsg) => void
}
interface SocketData {}

interface SInterServerEvents {}

type SocketFrom = 'device' | 'plugin'

declare type ServerSocket = Socket<SServerToClientEvents, SClientToServerEvents, SInterServerEvents, SocketData>;
declare class SocketServer {
    io: Server;
    rooms: string[];
    saveToImageFn: (params: SocketFileOptions) => Promise<string>;
    constructor(server: Server$1, options: {
        saveToImageFn: (params: SocketFileOptions) => Promise<string>;
    });
    initSocket(): void;
    logoutSocket(options: {
        socketFrom: SocketFrom;
        roomName: string;
        socketId: string;
    }): void;
    initDeviceSocket(socket: ServerSocket): void;
    initPluginSocket(socket: ServerSocket): void;
    checkExistRoom(roomName: string): boolean;
    broadcastRoomsToClient(): void;
    broadcastTransferImage(room: string, filepath: string): void;
}

export { SocketServer };
