const Koa = require('koa')
const app = new Koa()
// const views = require('koa-views')
const path = require('path')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const Koa2CORS = require('koa2-cors')
const ejsRender = require('koa-ejs');
const Utils = require('./utils')
const Constants = require('./constants')

const index = require('./routes/index')

// 创建临时图片目录
Utils.mkdirImgPath(Constants.imgTempPath())

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(Koa2CORS())
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

// 初始化ejs，设置后缀为html，文件目录为`views`
ejsRender(app, {
  root: path.join(__dirname, 'views'),
  layout: false,
  viewExt: 'html',
  cache: false,
  debug: false
})
// app.use(views(__dirname + '/views'))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
