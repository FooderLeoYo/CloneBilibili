/// <reference types="webpack-env" />

import * as React from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { loadableReady } from "@loadable/component";

import createStore from "./redux/store-creator";
import Root from "./App";


const createApp = (Component) => {
  // 拿到/server/renderer.js中_generateHTML内注水的initialState
  // __INITIAL_STATE__是自定义的名字
  const initialState = (window as any).__INITIAL_STATE__;
  // 客户端脱水
  const store = createStore(initialState);
  const App = () => {
    return (
      // Provider将store作为数据源提供给组件树使用
      <Provider store={store}>
        <Router>
          <Component />
        </Router>
      </Provider>
    );
  };
  return <App />;
}

// 所有分块的组件均加载后loadableReady被调用，然后客户端渲染服务端的html
loadableReady()
  .then(() => {
    // document.getElementById("app")拿到的就是服务端渲染的静态html的"app"div
    // hydrate方法会将静态html与createApp(Root)混合后渲染成动态DOM
    ReactDOM.hydrate(createApp(Root), document.getElementById("app"));
  });

// 热更新
if (module.hot) {
  module.hot.accept("./App", () => {
    const NewApp = require("./App").default;
    ReactDOM.hydrate(createApp(NewApp), document.getElementById("app"));
  });
}