// 使用redux作为服务端渲染数据源的原因是：
// 渲染需要的是多个异步数据，而只有全部拿到这些数据以后才能执行数据注水
// 那么先请求到的数据就必须先保存到一个地方，store就是一个选择

// 而有些组件的数据在客户端渲染的情况下也是先dispatch到redux是因为：
// 1、数据请求的代码逻辑基本相同，复用可减少代码量，重新写当然也可以
// 2、将某些之前请求过的、变化不频繁的数据，比如一二级tabbar，存到redux后，可通过判断redux中是否已经有该数据来避免重复请求，实现组件间对该数据的复用

// 注意服务端渲染阶段和客户端渲染阶段用的不是同一个store实例：
// 服务端渲染阶段的store只是一个临时的用来统一存放没齐的异步数据的容器，服务端渲染结束后它就没用了
// 客户端渲染阶段时，entry-client中会另外新建一个store，这个store才是项目真正运行时所依赖的

import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import reducer from "./reducers";

export default store => createStore(reducer, store, applyMiddleware(thunkMiddleware))
