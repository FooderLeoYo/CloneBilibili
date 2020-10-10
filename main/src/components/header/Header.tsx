import * as React from "react";
import { Link } from "react-router-dom";

import style from "./header.styl?css-modules";

const Header = () => {
  return (
    <div className={style.header}>
      {/* <a className={style.logo} href="/index"><Logo /></a> */}
      <Link className={style.logo} to="/index">
        <svg className="icon" aria-hidden="true">
          <use href="#icon-logo"></use>
        </svg>
      </Link>
      {/* <a className={style.searchIcon} href="/search"><i className="icon-search" /></a> */}
      <Link className={style.searchIcon} to="/search">
        <svg className="icon" aria-hidden="true">
          <use href="#icon-search"></use>
        </svg>
      </Link>
      {/* <a className={style.avatar} href="/space"><Avatar /></a> */}
      <Link className={style.avatar} to="/space">
        <svg className="icon" aria-hidden="true">
          <use href="#icon-avatar"></use>
        </svg>
      </Link>
    </div >
  );
}

export default Header;
