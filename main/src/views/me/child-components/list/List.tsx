import * as React from "react";

import Header from "./child-components/header/Header";
import { NestedRoute } from "../../../../router/router";

import style from "./list.styl?css-modules";

function List(props) {
  return (
    <div className="meList">
      <div className={style.topWrapper}><Header /></div>
      <div className={style.childRoutes}>
        {props.childRoutes.map((route, i) => <NestedRoute {...route} key={i} />)}</div>
    </div>
  )

}

export default List;
