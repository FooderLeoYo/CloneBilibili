import * as React from "react";
import { Helmet } from "react-helmet";
import { Redirect, Switch } from "react-router-dom";

import router, { NestedRoute, StatusRoute } from "./router/router";
import Context, { context } from "./context";

import "./app.styl";

class App extends React.Component {
  public render() {
    return (
      // 在顶层的Provider中传入value，在子孙级的Consumer中获取该值
      <Context.Provider value={context}>
        <div className="view">
          <Helmet>
            <title>( ゜- ゜)つロ干杯~</title>
            <meta name="title" content="Bilibili-( ゜- ゜)つロ干杯~" />
          </Helmet>
          <Switch>
            {/* {...route}表示传递route对象给NestedRoute的(route) */}
            {router.map((route, i) => <NestedRoute {...route} key={i} />)}
            <Redirect from="/" to="/index" exact={true} />
            {/* StatusRoute不需要给匹配条件 */}
            {/* 因为如果上面的路由都不匹配，那这个路径就没有组件与之匹配，也即404 */}
            <StatusRoute code={404}><div><h1>Not Found</h1></div></StatusRoute>
          </Switch>
        </div>
      </Context.Provider>
    );
  }
}

export default App;
