// 这个文件的作用是生成开发环境下的服务端和客户端webpack包bundle和clientManifest
// 并为这两个包添加以下内容：
//  1. 开发中更新频繁，因此添加热更新和内存读写中间件以提高打包速度
//  2. 异常捕获，并打印出来

const path = require("path");
const webpack = require("webpack");
const MFS = require("memory-fs");

const clientConfig = require("../config/webpack.config.client");
const serverConfig = require("../config/webpack.config.server");

module.exports = function setupDevServer(app, callback) {
  let bundle;
  let clientManifest;
  let resolve;
  const readyPromise = new Promise(r => resolve = r);

  const update = () => {
    // bundle是serverCompiler成功时赋值的，clientManifest是clientCompiler成功时赋值的
    // 这两者都都不是undefined说明服务端和客户端都成功了
    // 则通过callback将结果返回给调用者
    if (bundle && clientManifest) {
      callback(bundle, clientManifest);
      resolve();
    }
  }

  const readFile = (fs, fileName) => {
    return fs.readFileSync(path.join(clientConfig.output.path, fileName), "utf-8");
  }

  /* client部分 */

  // 修改webpack.config.client的相关配置，因为开发环境不能使用默认值，默认值是给生产环境用的
  // 将hot-middleware加入entry，这样客户端部分代码发生变更时，就能接收到通知并更新clientManifest
  clientConfig.entry.app =
    // 在想要多个依赖文件一起注入时，可以给entry传入数组
    ["webpack-hot-middleware/client", clientConfig.entry.app];
  clientConfig.output.filename = "static/js/[name].[hash].js";
  // 添加HotModuleReplacementPlugin，实现热更新
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  const clientCompiler = webpack(clientConfig);

  // 使用webpack-dev-middleware监听资源的变更，然后自动打包
  // webpack-dev-middleware将webpack文件打包到了内存中，使得访问代码文件速度更快
  const devMiddleware = require("webpack-dev-middleware")(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    logLevel: "warn"
  });
  app.use(devMiddleware);

  // 异常捕获及生成clientManifest
  clientCompiler.hooks.done.tap("done", stats => {
    const info = stats.toJson();
    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }
    if (stats.hasErrors()) {
      console.error(info.errors);
      return;
    }

    // 从webpack-dev-middleware中间件存储的内存中读取打包后的文件
    clientManifest =
      JSON.parse(readFile(devMiddleware.fileSystem, "client-manifest.json"));
    update();
  });

  app.use(require("webpack-hot-middleware")(clientCompiler));


  /* server部分 */
  const serverCompiler = webpack(serverConfig);
  // memory-fs实现内存缓存和快速数据处理，而非原生的从磁盘读写数据
  const mfs = new MFS();
  serverCompiler.outputFileSystem = mfs;
  // 监视serverCompiler，当它发生变化，也即服务端打包入口文件有更改，就更新
  serverCompiler.watch({}, (err, stats) => {
    const info = stats.toJson();
    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }
    if (stats.hasErrors()) {
      console.error(info.errors);
      return;
    }
    // server-bundle.json是webpack.config.server.js中自定义的名字
    // 是webpack的output经过SSRServerPlugin整合后的文件
    bundle = JSON.parse(readFile(mfs, "server-bundle.json"));
    update();
  });

  return readyPromise;
}
