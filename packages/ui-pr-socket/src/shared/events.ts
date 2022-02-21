export enum SOCKET_EVENTS {
  CONNECTION = 'connection',
  DISCONNECTION = 'disconnect',
  CLIENT_CONNECTION = 'connect'
}

export enum SERVER_EMIT_EVENTS {
  SEND_IMAGE = 'server-send-image',
  GET_IMAGE_FAIL = 'server-get-image-fail',
  OUT_ROOM = 'server-out-room',
  LIST_ROOMS = 'list-rooms',
  CREATED_ROOM = 'created-room',
  CREATED_ROOM_FAIL = 'created-room-fail',
  JOINED_ROOM = 'joined-room',
  JOIN_ROOM_FAIL = 'join-room-failure',
  OUTED_ROOM = 'outed-room',
  OUT_ROOM_FAIL = 'out-room-fail'
}

export enum CLIENT_EMIT_EVENTS {
  CREATE_ROOM = 'create-room',
  JOIN_ROOM = 'join-room',
  SEND_IMAGE = 'client-send-image',
  OUT_ROOM = 'client-out-room'
}
