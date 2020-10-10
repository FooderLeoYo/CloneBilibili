import * as React from "react";
import { Link } from "react-router-dom";

import style from "./header-with-back.styl?css-modules";

const HeaderWithBack = () => {
  return (
    <div className={style.header}>
      <div
        className={style.backBtn}
        onClick={() => { window.history.back(); }}
      >
        <svg className="icon" aria-hidden="true">
          <use href="#icon-back"></use>
        </svg>
      </div>
      <div className={style.logoWrapper}>
        <div className={style.logo}>
          {/* <a href="/index"><Logo /></a> */}
          <Link to="/index">
            <svg className="icon" aria-hidden="true">
              <use href="#icon-logo"></use>
            </svg>
          </Link>
        </div>
      </div>
      <div className={style.tools}>
        {/* <a className={style.searchIcon} href="/search"> */}
        <Link className={style.searchIcon} to="/search">
          <svg className="icon" aria-hidden="true">
            <use href="#icon-search"></use>
          </svg>
        </Link>
        {/* <a className={style.avatar} href="/space"> */}
        <Link className={style.avatar} to="/space">
          <svg className="icon" aria-hidden="true">
            <use href="#icon-avatar"></use>
          </svg>
        </Link>
        {/* </a> */}
        {/* </a> */}
      </div>

    </div>
  );
}

export default HeaderWithBack;
