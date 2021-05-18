const webpack = require("webpack");
const merge = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const nodeExternals = require("webpack-node-externals");
const baseWebpackConfig = require("./webpack.config.base");
const SSRServerPlugin = require("../plugin/webpack/server-plugin");
const util = require("./util");

// webpack-merge将webpack.config.base与本文件中的配置进行合并
const webpackConfig = merge(baseWebpackConfig, {
  entry: {
    app: "./src/entry-server.tsx"
  },
  output: {
    filename: "entry-server.js",
    libraryTarget: "commonjs2"  // 打包成commonjs2规范
  },
  target: "node",  // 指定node运行环境
  // externals的目的就是将不怎么需要更新的第三方库脱离webpack打包，不被打入bundle中
  // 但又不影响运用第三方库的方式，例如import方式等
  externals: [
    // 不打包node模块，保留为 require()
    nodeExternals({
      // 但css要打包
      whitelist: [/\.css$/]
    })
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js)$/,
        use: [
          {
            // webpack默认只识别js结尾的文件
            // loader是一种打包的方案，相当于定义一种规则，告诉webpack如何打包某种格式的文件
            loader: "babel-loader",
            options: {
              babelrc: false,
              plugins: [
                "dynamic-import-node",
                "@loadable/babel-plugin"
              ]
            }
          },
          {
            loader: "ts-loader",
            options: {
              // 设为true会显著提升打包速度
              // 但会丢失各依赖间的静态类型检查
              transpileOnly: true
            }
          },
          {
            loader: "eslint-loader"
          }
        ],
        exclude: /node_modules/
      },
      ...util.styleLoaders({
        sourceMap: false,
        usePostCSS: true,
        extract: true
      })
    ]
  },
  plugins: [
    // DefinePlugin的作用是创建全局变量
    new webpack.DefinePlugin({
      // 将process.env.REACT_ENV设置为server，会在async-action-creators中被使用
      // 如在ranking.ts中，就表明调用getRankingVideoList的是服务端的模板
      // 进而在dispatch数据时setShouldLoad(false)
      "process.env.REACT_ENV": JSON.stringify("server")
    }),
    // mini-css-extract-plugin将js中import的css文件提取出来，以link方式插入html
    // 防止将样式打包在js中导致单个文件过大引起网络请求超时
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash].css"
    }),
    // webpack默认的打包结果是个library，包含多个文件
    // SSRServerPlugin的作用就是将这些分散的文件整合成一个JSON文件
    new SSRServerPlugin({
      filename: "server-bundle.json"
    })
  ]
});

module.exports = webpackConfig;
