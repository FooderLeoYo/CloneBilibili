import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { getNavUserInfo } from "../../api/login";
import { exitLogin } from "../../api/me";

import HederWithBack from "../../components/header-with-back/HederWithBack";
import Top from "./child-components/basic-info/Top"

import style from "./me.styl?css-modules";

const { useState, useEffect } = React;

function Me() {
  const [navData, setNavData] = useState(null);

  useEffect(() => {
    getNavUserInfo().then(res => {
      const { code, data } = res.data;
      // console.log(data)
      if (code === 0) {
        setNavData(data);
      }
    });
  }, []);

  return (
    <div className="me">
      <Helmet><title>个人中心</title></Helmet>
      <div className={style.topWrapper}><HederWithBack /></div>
      <div className={style.meWrapper}>
        <Top navData={navData} />
        <div className={style.links}>
          <div className={style.videos}>
            <span className={style.history}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-history"></use>
              </svg>
            </span>
            <span className={style.later}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-watchLater"></use>
              </svg>
            </span>
            <span className={style.favorites}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-favorites"></use>
              </svg>
            </span>
            <span className={style.bangumi}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-bangumiSubscription"></use>
              </svg>
            </span>
          </div>
          <div className={style.creation}>
            <span>我的创作</span>
            <div>
              <span className={style.history}>
                <svg className="icon" aria-hidden="true">
                  <use href="#icon-history"></use>
                </svg>
              </span>
            </div>
          </div>
          <div className={style.asset}>
            <span>账户资产</span>
            <div>
              <span className={style.history}>
                <svg className="icon" aria-hidden="true">
                  <use href="#icon-history"></use>
                </svg>
              </span>
            </div>
          </div>
          <div className={style.profile}>
            <span>个人资料</span>
            <div>
              <span className={style.history}>
                <svg className="icon" aria-hidden="true">
                  <use href="#icon-history"></use>
                </svg>
              </span>
            </div>
          </div>
          <div className={style.security}>
            <span>账号安全</span>
            <div>
              <span className={style.history}>
                <svg className="icon" aria-hidden="true">
                  <use href="#icon-history"></use>
                </svg>
              </span>
            </div>
          </div>
          <div className={style.exitLogin} onClick={() => exitLogin()}>注销登录</div>
        </div>
      </div>
    </div>
  )
}

export default Me;