import * as React from "react";
import { Link } from "react-router-dom";

import Context from "@context/index";
import { getNavUserInfo } from "@api/login";
import { getPicSuffix } from "@customed-methods/image";

import style from "./logo-header-with-back.styl?css-modules";

const { useState, useEffect, useContext } = React;

function LogoHeaderWithBack() {
  const [isLogin, setIsLogin] = useState(false);
  const [faceUrl, setFaceUrl] = useState("");
  const context = useContext(Context);

  const getPicUrl = (url: string, format: string) => {
    const { picURL } = context;
    let suffix = ".webp";
    suffix = getPicSuffix();
    return `${picURL}?pic=${url}${format + suffix}`;
  }

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
        <span className={style.backBtn} onClick={() => window.history.back()}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-arrowDownBig"></use>
          </svg>
        </span>
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
            <Link className={style.face} to="/me"><img src={getPicUrl(faceUrl, "@320w_200h")} /></Link> :
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

export default LogoHeaderWithBack;
