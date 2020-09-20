import * as React from "react";
import { Route } from "react-router-dom";

const NestedRoute = route => (
  <Route
    path={route.path}
    exact={route.exact}
    render={props => <route.component
      // {...props}表示：将其他从父路由处接收到props传递给子路由
      {...props}
      // childRoutes不在本文件生成子路由，而是在Space.tsx中
      childRoutes={route.routes}
    />}
  />
)

export default NestedRoute;
