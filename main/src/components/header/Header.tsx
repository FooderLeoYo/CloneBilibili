import * as React from "react";
import { Link } from "react-router-dom";

import Logo from "../logo/Logo";
import Avatar from "../avatar/Avatar";

import style from "./header.styl?css-modules";

const Header = () => {
  return (
    <div className={style.header}>
      {/* <a className={style.logo} href="/index"><Logo /></a> */}
      <Link className={style.logo} to="/index"><Logo /></Link>
      {/* <a className={style.avatar} href="/space"><Avatar /></a> */}
      <Link className={style.avatar} to="/space"><Avatar /></Link>
      {/* <a className={style.searchIcon} href="/search"><i className="icon-search" /></a> */}
      <Link className={style.searchIcon} to="/search">
        <i className="icon-search" />
      </Link>
    </div>
  );
}

export default Header;
