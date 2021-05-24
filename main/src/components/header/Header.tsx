import * as React from "react";
import { Link } from "react-router-dom";

import { getNavUserInfo } from "../../api/login";
import style from "./header.styl?css-modules";

const { useState, useEffect } = React;

function Header() {

  const [isLogin, setIsLogin] = useState(false);
  const [faceUrl, setFaceUrl] = useState("");

  useEffect(() => {
    getNavUserInfo().then(res => {
      const { code, data } = res.data;
      if (code === 0) {
        setIsLogin(true);
        setFaceUrl(data.face);
      }
    });
  }, []);

  return (
    <div className={style.header}>
      {/* <a className={style.logo} href="/index"><Logo /></a> */}
      <Link className={style.logo} to="/index">
        <svg className="icon" aria-hidden="true">
          <use href="#icon-logo"></use>
        </svg>
      </Link>
      <div className={style.tools}>
        {/* <a className={style.searchIcon} href="/search"><i className="icon-search" /></a> */}
        <Link className={style.search} to="/search">
          <svg className="icon" aria-hidden="true">
            <use href="#icon-search"></use>
          </svg>
        </Link>
        {/* <a className={style.avatar} href="/space"><Avatar /></a> */}
        {
          isLogin ?
            <Link className={style.face} to="/space"><img src={faceUrl} alt="Face" /></Link> :
            <Link className={style.avatar} to="/login">
              <svg className="icon" aria-hidden="true">
                <use href="#icon-avatar"></use>
              </svg>
            </Link>
        }

      </div>
    </div >
  );
}

export default Header;
