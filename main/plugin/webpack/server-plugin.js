// 由于项目是模块化的，因此webpack的打包结果会是相互require的多个文件
// 而这个插件就是把这些分散的文件整合成一个JSON文件

const { isJS, onEmit, validateConfig } = require("./util");

module.exports = class SSRServerPlugin {
  constructor(opts = {}) {
    this.options = Object.assign({
      filename: "server-bundle.json",
    }, opts);
  }

  apply(compiler) {
    validateConfig(compiler);

    onEmit(compiler, "ssr-server-plugin", (compilation, callback) => {
      const stats = compilation.getStats().toJson();

      if (Object.keys(stats.entrypoints).length > 1) {
        throw new Error(
          "Server-side bundle should have one single entry file. "
        );
      }

      /* 生成bundle */
      const entryName = Object.keys(stats.entrypoints)[0];
      const entryInfo = stats.entrypoints[entryName];

      if (!entryInfo) {
        return callback();
      }

      const entryAssets = entryInfo.assets.filter(isJS);
      const entry = entryAssets[0];

      const bundle = {
        entry,
        files: {},
        maps: {}
      }

      /* 往bundle中写入files和maps */
      stats.assets.forEach(asset => {
        if (asset.name.match(/\.js$/)) {
          bundle.files[asset.name] = compilation.assets[asset.name].source();
        } else if (asset.name.match(/\.js\.map$/)) {
          bundle.maps[asset.name.replace(/\.map$/, "")] =
            JSON.parse(compilation.assets[asset.name].source());
        }
        // do not emit anything else for server
        delete compilation.assets[asset.name];
      })

      if (Object.keys(bundle.files).length > 1) {
        throw new Error(
          "Server-side bundle should output one single file. " +
          "If you are using code splitting, you should use `dynamic-import-node` babel plugin. "
        );
      }

      const json = JSON.stringify(bundle, null, 2)
      const filename = this.options.filename

      compilation.assets[filename] = {
        source: () => json,
        size: () => json.length
      }

      callback();
    });
  }
}
