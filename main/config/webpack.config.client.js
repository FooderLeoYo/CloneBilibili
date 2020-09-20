const path = require("path");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const LoadablePlugin = require("@loadable/webpack-plugin");
const baseWebpackConfig = require("./webpack.config.base");
const util = require("./util");

const isProd = process.env.NODE_ENV === "production";

// path.resolve() 把一个路径解析为一个绝对路径
const resolve = relativePath => path.resolve(__dirname, relativePath);

const webpackConfig = merge(baseWebpackConfig, {
  entry: {
    app: "./src/entry-client.tsx"
  },
  output: {
    // 客户端打包内容全在/dist/static/js目录下
    filename: "static/js/[name].[chunkhash].js"
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              babelrc: false,
              plugins: [
                "@loadable/babel-plugin"
              ]
            }
          },
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            }
          },
          {
            loader: "eslint-loader"
          }
        ],
        // 只为include的文件目录执行以上loader，加快打包速度
        include: [resolve("../src")]
      },
      ...util.styleLoaders({
        sourceMap: false,
        usePostCSS: true,
        extract: isProd ? true : false
      })
    ]
  },
  optimization: {
    // webpack中的module、chunk、bundle
    // module：应用的其中一部分，实现各个子功能，简单来说就是通过import语句引入的代码
    // chunk：chunk是webpack根据功能拆分出来的，包含三种情况：
    // 　　　　1、你的项目入口（entry）
    // 　　　　2、通过import()动态引入的代码
    //        3、通过splitChunks拆分出来的代码
    //        chunk包含module，即chunk由一个或多个module组成
    // bundle：bundle是对chunk进行编译压缩打包等处理之后的产出，一般和chunk是一对一的关系
    splitChunks: {
      // chunks选项的含义是拆分模块的范围，它有三个值async、initial和all
      // async表示只从异步加载的模块（动态加载import()）里面进行拆分
      // initial表示只从入口模块进行拆分
      // all表示以上两者都包括
      chunks: "all",
      // splitChunks有两个缓存组：vender和default
      cacheGroups: {
        // 规定了哪些文件会被打包成vendor组
        vendor: {
          test: function (module) {
            // 阻止.css文件资源打包到vendor chunk中
            if (module.resource && /\.css$/.test(module.resource)) {
              return false;
            }
            // node_modules目录下的模块会被打包到vendor chunk中
            return module.context && module.context.includes("node_modules");
          }
        }
      }
    },
    // 设置runtimeChunk将包含chunks 映射关系的 list从 app.js中抽离出来单独打包
    // list在每次有模块发生变更时都会变更，若不抽离，则会导致app.js跟着list改变
    // 从而导致app.js缓存失败(app.js不能变)
    runtimeChunk: {
      name: "manifest"
    }
  },
  plugins: [
    // 在单独的进程中执行类型检查加快编译速度
    new ForkTsCheckerWebpackPlugin({
      async: false,
      tsconfig: resolve("../tsconfig.json")
    }),
    // 将打包结果整合成一个JSON文件
    new LoadablePlugin({
      filename: "client-manifest.json",
    })
  ]
});

if (isProd) {
  webpackConfig.plugins.push(
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash].css"
    })
  );
}

module.exports = webpackConfig;
