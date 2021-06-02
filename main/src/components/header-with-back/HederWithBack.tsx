import * as React from "react";
import { Link } from "react-router-dom";

import { getNavUserInfo } from "../../api/login";
import style from "./header-with-back.styl?css-modules";

const { useState, useEffect } = React;

function HeaderWithBack() {
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
      <div className={style.backWrapper}>
        <div className={style.backBtn} onClick={() => window.history.back()}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-back"></use>
          </svg>
        </div>
      </div>
      <div className={style.logoWrapper}>
        <div className={style.logo}>
          <Link to="/index">
            <svg className="icon" aria-hidden="true">
              <use href="#icon-logo"></use>
            </svg>
          </Link>
        </div>
      </div>
      <div className={style.tools}>
        <Link className={style.search} to="/search">
          <svg className="icon" aria-hidden="true">
            <use href="#icon-search"></use>
          </svg>
        </Link>
        {
          isLogin ?
            <Link className={style.face} to="/space"><img src={faceUrl} alt="Face" /></Link> :
            <Link className={style.avatar} to="/login">
              <svg className="icon" aria-hidden="true">
                <use href="#icon-avatar"></use>
              </svg>
              <span className={style.login}>登录</span>
            </Link>
        }
      </div>
    </div>
  );
}

export default HeaderWithBack;
