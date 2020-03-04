const path = require('path')

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

// 图片路径
function imgTempPath () {
  return path.join(__dirname, `/temp/images`)
}

module.exports = {
  port: normalizePort(process.env.PORT || '3000'),
  imgTempPath
}