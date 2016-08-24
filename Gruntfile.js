module.exports = function(grunt) {
  var gtx = require('gruntfile-gtx').wrap(grunt);

  gtx.loadAuto();

  var gruntConfig = require('./grunt');
  gruntConfig.package = require('./package.json');
  gtx.config(gruntConfig);
  gtx.alias('default', ['concat: test'])
  gtx.alias('live', ['connect', 'watch'])
  gtx.finalise();
}

