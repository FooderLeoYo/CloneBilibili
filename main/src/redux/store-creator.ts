// 使用redux的原因是
// 将ssr预取数据整合为一个数据源，并且能够高效地提供给组件树中的任一子组件
// redux的store之于props的优点，就是它不需要一层层的依次往下传递
// 而预取数据的使用对象显然可能是组件树中的任一子组件
// 因此若不用redux而是props传递这些预取数据，将会非常麻烦：1.父组件中使用子组件
// 处需要添加传递的属性，子组件才能拿到这些props；2.props还传递给了该父组件和该
// 子组件之间许多并不需要这些props的中间层组件

// 非ssr SPA不需要一个store作为统一数据源是因为，它没有数据预取这一步，数据都是
// 在组件mount以后才调用异步api获取的，并不需要一开始就提供一个统一数据源

import { createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";

import reducer from "./reducers";

export default (store) => {
  return createStore(
    reducer,
    store,
    applyMiddleware(thunkMiddleware)
  );
}