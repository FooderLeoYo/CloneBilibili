import * as React from "react";
import { Route } from "react-router-dom";

const StatusRoute = (props) => (
  <Route render={({ staticContext }) => {
    // staticContext是react router内置API，用于服务端渲染
    // 为它赋值就是为StaticRouter的context赋值
    if (staticContext) {
      staticContext.statusCode = props.code;
    }
    // children是props的内置API，可以拿到用户在组件里面放置的内容
    // 目前props中只有code，但如果功能扩展则会有其他东西，而返回空不影响，所以一起返回
    return props.children;
  }} />
);

export default StatusRoute;
