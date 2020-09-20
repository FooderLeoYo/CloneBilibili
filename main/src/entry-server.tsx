// 服务器 entry 使用 default export 导出函数，并在每次渲染中重复调用此函数

import * as React from "react";
import { StaticRouter } from "react-router-dom";
import { Provider } from "react-redux";

import router from "./router/router";
import createStore from "./redux/store-creator";
import Root from "./App";

const createApp = (context, url, store) => {
  const App: any = () => {
    return (
      <Provider store={store}>
        {/* StaticRouter的静态体现在： */}
        {/* 它被使用在服务端，而服务端不会出现客户端那样的路由跳转(即不发生页面刷新) */}
        {/* 只会根据location属性加载对应该location的组件 */}
        {/* 遇到新请求时ocation属性改变，进而加载对应该location的组件 */}
        {/* 然后发送新的响应给客户端并触发页面刷新 */}
        {/* 它与router的关系是它需要按照客户端router的路由关系，来为请求url加载对应的组件 */}
        <StaticRouter context={context} location={url}>
          <Root />
        </StaticRouter>
      </Provider>
    )
  }
  return <App />;
}

// 与entry-client不同，entry-server文件中并没有执行创建操作而是将创建方法暴露出去
// 由renderer.js调用来执行创建，因为不是创建出App就行了，还要将其renderToString
// 索性就将这些操作统一放在在服务端renderer中执行
export {
  createApp,
  createStore,
  router
};
