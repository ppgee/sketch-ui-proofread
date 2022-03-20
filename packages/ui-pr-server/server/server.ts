import path from 'path';
import { createServer } from 'http'
import Koa from 'koa';
import KoaStatic from 'koa-static';
import { createSocketServer } from './plugins/socket.server'
import { findLocalIPAddress } from './utils';

const APP_PORT = 3000

const app = new Koa()
app.use(KoaStatic(path.join(__dirname, '../dist')));
app.use( async ( ctx ) => {
  ctx.body = 'hello world'
})

// 监听
const server = createServer(app.callback())
createSocketServer(server)
server.listen(APP_PORT, () => {
  console.log(`
    App runing at:
    - Local:   http://localhost:${APP_PORT}/
    - Network: http://${findLocalIPAddress()}:${APP_PORT}/
  `)
})
