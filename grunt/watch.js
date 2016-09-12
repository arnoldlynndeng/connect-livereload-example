var lrPort = require('./lrMiddleware').lrPort
module.exports = {
	options: {
     livereload: lrPort
   },
  client: {
    files: ['src/client/js/**/*.js'],
    tasks: ['concat:test']
  },
  html: {
  	files: ['src/client/**/*.html']
  }
}