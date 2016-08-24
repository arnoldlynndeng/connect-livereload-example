var lrPort = require('./lrMiddleware').lrPort
module.exports = {
  client: {
    options: {
      livereload: lrPort
    },
    files: ['src/client/js/**/*.js'],
    tasks: ['concat:test']
  }
}