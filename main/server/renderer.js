// 这个文件的作用是渲染出html字符串:
// 将bundle和manifest渲染成服务端的纯html
// 然后为这个骨架添加js/css的链接、state、客户端打包内容(均是字符串，并没有真正应用到html)

const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { matchRoutes } = require("react-router-config");
const { Helmet } = require("react-helmet");
const { ChunkExtractor, ChunkExtractorManager } = require("@loadable/server");

class ServerRenderer {
  constructor(bundle, template, manifest) {
    this.template = template;
    this.manifest = manifest;
    this.serverEntry = this._createEntry(bundle);
  }

  // staticContext是在/router/StatusRoute.tsx中赋值的
  serverRender(request, staticContext) {
    return new Promise((resolve, reject) => {
      const serverEntry = this.serverEntry;
      // 这三个东西是entry-server.tsx里面的
      const createApp = serverEntry.createApp;
      const createStore = serverEntry.createStore;
      const router = serverEntry.router;
      const store = createStore({});

      // render主要做了以下5件事：
      //  1. 根据request.url创建component，并为其添加context、store
      //  2. 用客户端打包文件manifest生成extractor
      //  3. 使用renderToString方法，用component和extractor生成root，也即html骨架
      //  4. 错误处理
      //  5. 调用_generateHTML为html添加js/css的链接、state、客户端打包内容(均为字
      //     符串，并没有真正应用到htm)，将这些包裹在resolve中
      const render = () => {
        // context存放组件内部路由相关属性，包括状态码，地址信息，重定向的url
        let context = {};
        if (staticContext && staticContext.constructor === Object) {
          Object.assign(context, staticContext);
        }

        // 服务端需要渲染的html在这一步拿到了context、store
        let component = createApp(context, request.url, store);

        // ChunkExtractor能从打包文件中提取出js、css链接字符串
        let extractor = new ChunkExtractor({
          // 拿到了客户端打包内容manifest，里面包含js、css的链接
          stats: this.manifest,
          entrypoints: ["app"]
        });

        // 这里的root就是服务端生成的不带js、css的html字符串
        // 但是root中有context以及包含数据的store
        let root = ReactDOMServer
          // 服务器端是无法调用浏览器API的，就需要借助renderToString
          // 此API直接在服务器端将DOM字符串拼凑完成，交给node输出到浏览器
          .renderToString(
            React.createElement(
              ChunkExtractorManager, // type
              { extractor }, // props
              component // children
            ));

        // 此时render是通过Promise.all调用的，故已创建一个真实组件，有自己的context
        // 这个context是StaticRouter的一个属性，服务端渲染过程中，组件会添加相关属性
        // (比如下面的url、statusCode)到context

        if (context.url) {  // 当发生重定向时，StaticRouter会为context设置url
          resolve({
            error: { url: context.url }
          });
          return;
        }

        // 有statusCode字段表示路由App.tsx中的路由表匹配到了StatusRoute
        // statusCode是在StatusRoute.tsx中赋值的
        if (context.statusCode) {
          resolve({
            error: { code: context.statusCode }
          });
        } else {
          // 这里是整个文件的最终返回结果
          resolve({
            error: undefined,
            html: this._generateHTML(root, extractor, store.getState())
          });
        }
      }

      // 对所有匹配的路由组件调用 `asyncData()`，asyncData会dispatch数据到store
      let matches = matchRoutes(router, request.path);
      let promises = matches.map(({ route, match }) => {
        // asyncData是/front/src/router/router.ts中的，resolve后会dispatch数据到store
        const asyncData = route.asyncData;
        return asyncData ?
          asyncData(store, Object.assign(match.params, request.query)) :
          Promise.resolve(null);
      });
      // 这里就是服务端渲染的数据要先存到store的原因
      // 渲染需要的是多个异步数据，而只有全部拿到这些数据以后才能执行渲染
      // 那么先请求到的数据就必须先保存到一个地方，store就是一个选择
      // 再加上store使得我们可以复用某些之前请求过的、变化不频繁的数据，比如一二级tabbar，这样就可以避免重复请求
      Promise.all(promises)
        .then(() => render()) // 所有asyncData都resolve后，store中渲染应用程序所需的的数据就齐全了
        .catch(error => reject(error));
    });
  }

  // 用沙箱的原因是前后端同构，因此必然有同名变量
  // 沙箱可以使得服务端包运行在一个隔离的环境，避免其与客户端包内容相互混淆
  _createEntry(bundle) {
    const file = bundle.files[bundle.entry];
    const vm = require("vm");
    const sandbox = {
      console,
      module,
      require,
    };
    // 在一个新的 sandbox 的作用域范围内运行脚本
    vm.runInNewContext(file, sandbox);

    return sandbox.module.exports;
  }

  // 为html骨架添加js/css等的链接、state、客户端打包内容(均是字符串，并没有真正被应用到html)
  _generateHTML(root, extractor, initalState) {
    // 调用renderToString()后需要调用renderStatic()才能获取head相关信息
    let head = Helmet.renderStatic();
    return this.template
      .replace(/<title>.*<\/title>/, `${head.title.toString()}`)
      // 通过extractor.某某，为html骨架添加js、css、state、客户端打包内容的链接字符串
      .replace("<!--react-ssr-head-->",
        `${head.meta.toString()}\n${head.link.toString()}\n${extractor.getLinkTags()}\n${extractor.getStyleTags()}
    <script type="text/javascript">
      window.__INITIAL_STATE__ = ${JSON.stringify(initalState)}
    </script>`)
      .replace("<!--react-ssr-outlet-->", `<div id="app">${root}</div>\n${extractor.getScriptTags()}`);
  }
}

module.exports = ServerRenderer;
