import * as React from "react";

import HederWithBack from "../../components/header-with-back/HederWithBack";
import { NestedRoute } from "../../router/router";

import banner from "../../assets/images/banner-top.png";
import style from "./stylus/space.styl?css-modules";

const Space = props => {
  return (
    <div className="space">
      <div className={style.topWrapper}>
        <HederWithBack />
      </div>
      <div className={style.banner}>
        <img src={banner} />
      </div>
      {
        // 这里的props.childRoutes来自于/router/NestedRoute.tsx中的childRoutes={route.routes}
        props.childRoutes.map((route, i) =>
          // 每一层的NestedRoute只能指定当前层的path，route.routes只是作为props传递
          // 因此虽然App.tsx中使用了NestedRoute，子路由还是需要再使用NestedRoute
          // 并且将拿到的childRoutes传进子层的NestedRoute，才能实现子层的跳转
          <NestedRoute {...route} key={i} />
        )
      }
    </div>
  )

};

export default Space;
