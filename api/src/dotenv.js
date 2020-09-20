// dotenv是用来按需加载不同的环境变量文件.env

const path = require("path");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
// Config environment variables
dotenv.config({
  // process.cwd() 方法会返回 Node.js 进程的当前工作目录
  // path.resolve会进行路径拼接
  path: path.resolve(process.cwd(), `.env.${env}`)
});
