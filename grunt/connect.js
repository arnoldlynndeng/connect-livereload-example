var lrMiddleware = require('./lrMiddleware').lrMiddleware;
var livereload = require('connect-livereload')
module.exports = {
  options: {
    port: 8080,
    hostname: 'localhost',
    base: '.'
  },
  livereload: {
    options: {
      middleware: lrMiddleware
    }
  }
}