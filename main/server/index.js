// ssr配置流程看vue官网指南

// ssr与一般渲染的最大区别是：
// 一般渲染是把webpack打包好的东西一股脑丢给客户端，客户端需要自己拼接字符串、获取数据以渲染成html
// ssr相当于服务端替客户端分担了用webpack包渲染html这项工作，客户端只需要绑定js交互、css样式等

// 本项目ssr的大致流程：
//  1. 服务端收到客户端的get请求(96行)，调用render方法(55行)
//  2. render方法中处理图片后缀
//  3. 使用renderer。而renderer则是之前根据请求url，以及当前是生产环境还是开发环境，将
//     (生产环境下已打包好)，或先生成(在dev-server.js中执行)再将webpack打包文件
//     bundle(服务端)和manifest(客户端)传进ServerRenderer，调用构造函数所生成的
//  4. renderer生成后，调用自身serverRender方法生成html，过程在renderer.js中进行：
//       a. 由服务端打包文件bundle，用entry-server暴露的方法，拿到createApp方法和
//          router并创建空的store
//       b. 将请求路径逐一与router进行匹配，匹配成功的将调用asyncData，dispatch数据
//          到store中
//       c. 所有的asyncData均resolve后，调用render方法，渲染出所需的html骨架。
//          具体过程见renderer.js第27行注释的5件事
//  5. 错误处理，然后res.send(html)
//  6. 客户端拿到静态html后，根据其中的客户端包资源link加载entry-client.tsx及其他css、js
//  7. 执行entry-client.tsx中的hydrate方法，生成动态DOM

const express = require("express");
const fs = require("fs");
const path = require("path");

const ServerRenderer = require("./renderer");

// ssr发生在这个express实例中，而不是back中那个express实例
const app = express();

const isProd = process.env.NODE_ENV === "production";
let renderer;
let readyPromise;
let template = fs.readFileSync("./templates/index.html", "utf-8");

// 开放../public为静态资源
app.use("/public", express.static(path.join(__dirname, "../public")));

// 根据是生产还是开发环境，生成对应的renderer
// bundle就是服务端的代码经webpack打包后的包，clientManifest就是客服端的
if (isProd) {
  app.use("/dist", express.static(path.join(__dirname, "../dist")));
  // 在生产环境下run build以后才会有dist目录
  let bundle = require("../dist/server-bundle.json");
  let clientManifest = require("../dist/client-manifest.json");
  renderer = new ServerRenderer(bundle, template, clientManifest);
} else {
  readyPromise = require("./dev-server")(app, (bundle, clientManifest) => {
    renderer = new ServerRenderer(bundle, template, clientManifest);
  });
}

// 使用renderer渲染出服务端的纯html，然后发送给客户端
const render = (req, res) => {
  console.log("======enter server======");
  console.log("visit url: " + req.url);

  // 处理图片后缀
  let picSuffix = ".jpg";
  const userAgent = req.get("User-Agent");
  if (userAgent) {
    if (/(iPhone|iPad|iPod|iOS)/i.test(userAgent)) { // 判断iPhone|iPad|iPod|iOS
      picSuffix = ".jpg";
    } else if (/(Android)/i.test(userAgent)) {  // 判断Android
      picSuffix = ".webp";
    }
  }

  // renderer调用自身的serverRender生成服务端的纯html，然后发送给客户端
  const context = { picSuffix };
  renderer.serverRender(req, context)
    .then(({ error, html }) => {
      if (error) {
        if (error.url) {
          res.redirect(error.url);
        } else if (error.code) {
          if (error.code === 404) {
            const html = fs.readFileSync("./templates/404.html", "utf-8");
            res.status(404).send(html);
          } else {
            res.status(error.code).send("error code：" + error.code);
          }
        }
      }
      res.send(html);
    }).catch(error => {
      console.log(error);
      const html = fs.readFileSync("./templates/500.html", "utf-8");
      res.status(500).send(html);
    });
}

// 收到客户端的get请求后，生成服务端的纯html，发给客户端
// 该html中有context、客户端webpack包manifest以及initalState
app.get("*", isProd ? render : (req, res) => {
  // 开发环境下，等待客户端和服务端打包完成后才能生成html
  readyPromise.then(() => render(req, res));
});

const port = 3010;
app.listen(port, () => {
  console.log("Main server is running at port " + port);
});
