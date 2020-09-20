// 这个文件是关于生成客户端包的配置，在/server/dev-server.js被使用

const webpack = require("webpack");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

let env = "dev";
let isProd = false;
if (process.env.NODE_ENV === "production") {
  env = "prod";
  isProd = true;
}

const baseWebpackConfig = {
  mode: isProd ? "production" : "development",
  devtool: isProd ? "#source-map" : "#cheap-module-source-map",
  output: {
    path: path.resolve(__dirname, "../dist"),
    // publicPath用于处理打包前后静态资源的引用地址url变动的问题
    // 开发时图片是放在public下的，而打包后变成了dist下的static（自定义的）
    // 因此要将dist拼接上去，才是正确的新url
    publicPath: "/dist/"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: "url-loader",
        options: {
          limit: 2048,
          // static/img是文件夹，后面的才是文件名
          name: "static/img/[name].[hash:7].[ext]"
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        loader: "url-loader",
        options: {
          limit: 1,
          name: "static/fonts/[name].[hash:7].[ext]"
        }
      }
    ]
  },
  optimization: {
    // mode为production自动启用
    minimizer: [
      new TerserPlugin({
        sourceMap: false
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: false
        }
      })
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": require("./" + env + ".env")
    })
  ]
}

module.exports = baseWebpackConfig;
