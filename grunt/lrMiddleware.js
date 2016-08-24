var lrPort = 35729;
// 使用connect-livereload模块，生成一个与LiveReload脚本
// <script src="http://127.0.0.1:35729/livereload.js?snipver=1" type="text/javascript"></script>
var lrSnippet = require('connect-livereload')({ port: lrPort });
var serveStatic = require('serve-static');
var serveIndex = require('serve-index');
// 使用 middleware(中间件)，就必须关闭 LiveReload 的浏览器插件
var lrMiddleware = function(connect, options, middlewares) {
  console.log(options.base, 'connect')
  return [
    // 把脚本，注入到静态文件中
    lrSnippet,
    // 静态文件服务器的路径
    serveStatic(options.base[0] + '/src/client'),
    // 启用目录浏览(相当于IIS中的目录浏览)
    serveIndex(options.base[0])
  ];
};
module.exports = {
  lrMiddleware: lrMiddleware,
  lrPort : lrPort
}