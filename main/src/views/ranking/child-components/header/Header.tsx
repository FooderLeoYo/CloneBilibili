import * as React from "react";

import style from "./header.styl?css-modules";

function Header() {
  return (
    <div className={style.header}>
      <span onClick={() => window.history.back()} className={style.backBtn}>
        <svg className="icon" aria-hidden="true">
          <use href="#icon-arrowDownBig"></use>
        </svg>
      </span>
      <span>排行榜</span>
    </div>
  )
}

export default Header;