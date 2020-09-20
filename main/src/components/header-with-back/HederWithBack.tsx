import * as React from "react";
import { Link } from "react-router-dom";

import Logo from "../logo/Logo";
import Avatar from "../avatar/Avatar";

import style from "./header-with-back.styl?css-modules";
import back from "../../assets/images/back.png";


const HeaderWithBack = () => {
  return (

    <div className={style.header}>
      <div
        className={style.backBtn}
        onClick={() => { window.history.back(); }}
      >
        <img src={back} />
      </div>
      <div className={style.logoWrapper}>
        <div className={style.logo}>
          {/* <a href="/index"><Logo /></a> */}
          <Link to="/index"><Logo /></Link>
        </div>
      </div>
      <div className={style.tools}>
        {/* <a className={style.avatar} href="/space"> */}
        <Link className={style.avatar} to="/space">
          <Avatar />
        </Link>
        {/* </a> */}
        {/* <a className={style.searchIcon} href="/search"> */}
        <Link className={style.searchIcon} to="/search">
          <i className="icon-search" />
        </Link>
        {/* </a> */}
      </div>

    </div>
  );
}

export default HeaderWithBack;
