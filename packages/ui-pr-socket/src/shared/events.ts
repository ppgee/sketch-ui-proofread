export enum SOCKET_EVENT {
  SERVER_CONNECTION = 'connection',
  CLIENT_CONNECTION = 'connect',
  DISCONNECTION = 'disconnect',
  UPLOAD_IMAGE = 'upload-image',
  UPLOAD_IMAGE_FAILURE = 'upload-image-failure',
  SERVER_SEND_IMAGE = 'server-send-image',
  PLUGIN_REGISTER = 'plugin-register',
  PLUGIN_REGISTER_SUCCESS = 'plugin-register-success',
  PLUGIN_REGISTER_FAILURE = 'plugin-register-failure',
  CLIENT_GET_ROOMS = 'client-get-plugins',
  CLIENT_OUT_ROOM = 'client-out-room',
}