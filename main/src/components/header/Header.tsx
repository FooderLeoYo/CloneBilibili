import * as React from "react";
import { Link } from "react-router-dom";

import style from "./header.styl?css-modules";

const Header = () => {
  return (
    <div className={style.header}>
      {/* <a className={style.logo} href="/index"><Logo /></a> */}
      <Link className={style.logo} to="/index">
        <i className="iconfont icon-logo"></i>
      </Link>
      {/* <a className={style.avatar} href="/space"><Avatar /></a> */}
      <Link className={style.avatar} to="/space">
        <i className="iconfont icon-avatar"></i>
      </Link>
      {/* <a className={style.searchIcon} href="/search"><i className="icon-search" /></a> */}
      <Link className={style.searchIcon} to="/search">
        <i className="iconfont icon-search"></i>
      </Link>
    </div>
  );
}

export default Header;
