// Make sure to load the environment variable first
require("./dotenv");

const express = require("express");
// body-parser是请求体解析中间件
// 原生的req是非常混乱的，想要拿到需要的参数很困难
// 使用body-parser后，会在req对象上面新增一个req.body的一个对象
// 请求体解析后，解析值都会被放到req.body属性，解析值一般就是我们需要的参数
const bodyParser = require("body-parser");

const crossDomain = require("./middleware/cross-domain");
const userAgent = require("./middleware/user-agent");
const log = require("./middleware/log");
const routers = require("./routers");
const log4js = require("./log4js");

// getLogger括号内的参数仅代表类别，相当于一个标志，没有其他的作用
const logger = log4js.getLogger(process.env.LOG_CATEGORY);

// 这个express实例的作用只是作为中台获取后台数据，ssr并不发生在这个实例中
const app = express();

if (process.env.NODE_ENV !== "production") {
  app.use(express.static("./"));
}

// bodyParser.json()返回一个用来解析json格式的中间件
app.use(bodyParser.json());

app.use(log);

app.use(userAgent);

app.use(crossDomain);

app.use(routers);

// Error handling
app.use(function (err, req, res, next) {
  // The error.stack property is a string describing the point in the code at which the Error was instantiated
  logger.error(err.stack);
  res.status(500).send({
    // res.send的内容是自定义的，因此这里的code、msg也可以是任何其他内容
    code: "-1",
    msg: err.stack
  });
});

/* eslint-disable no-console */
app.listen(3011, () => {
  console.log("Api server is running at port 3011");
});
