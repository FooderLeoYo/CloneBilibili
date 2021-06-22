// 使用redux作为服务端渲染数据源的原因详见server/renderer第99行开始的注释

// 而有些组件的数据在客户端渲染的情况下也是先dispatch到redux是因为：
// 1、数据请求的代码逻辑基本相同，复用可减少代码量，重新写当然也可以
// 2、将某些之前请求过的、变化不频繁的数据，比如一二级tabbar，存到redux后，可通过判断redux中是否已经有该数据来避免重复请求，实现组件间对该数据的复用

import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";

import reducer from "./reducers";

export default store => {
  return createStore(reducer, store, applyMiddleware(thunkMiddleware));
}