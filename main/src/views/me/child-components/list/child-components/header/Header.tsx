import * as React from "react";
import { Link } from "react-router-dom";

import style from "./header.styl?css-modules";

const { useState, useEffect } = React;

function Header() {
  const [type, setType] = useState("");

  useEffect(() => {
    const url = location.pathname;

    if (url === "/me/list/history") { setType("历史记录") }
    else if (url === "/me/list/favorites") { setType("我的收藏") }
    else if (url === "/me/list/bangumi") { setType("我的订阅") }
    else if (url === "/me/list/later") { setType("稍后再看") }
  }, []);

  return (
    <div className={style.header}>
      <div className={style.backWrapper}>
        <span className={style.backBtn} onClick={() => window.history.back()}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-arrowDownBig"></use>
          </svg>
        </span>
      </div>
      <div className={style.listType}>{type}</div>
      <div className={style.tools}>
        <Link className={style.search} to="/search">
          <svg className="icon" aria-hidden="true">
            <use href="#icon-search"></use>
          </svg>
        </Link>
        <div className={style.edit}>编辑</div>
      </div>
    </div>
  );
}

export default Header;
