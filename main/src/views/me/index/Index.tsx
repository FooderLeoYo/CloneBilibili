import * as React from "react";
import { Helmet } from "react-helmet";

import { getNavUserInfo } from "../../../api/login";
import { exitLogin } from "../../../api/me";

import HederWithBack from "../../../components/header-with-back/HederWithBack";
import Top from "./child-components/top/Top";
import VideoLinks from "./child-components/link/Videos";

import style from "./index.styl?css-modules";

const { useState, useEffect } = React;

function Index(props) {
  const [navData, setNavData] = useState(null);

  useEffect(() => {
    getNavUserInfo().then(res => {
      const { code, data } = res.data;
      // console.log(data)
      if (code === 0) {
        setNavData(data);
      } else { props.history.push("/login/"); }
    });
  }, []);

  return (
    <div className="me">
      <Helmet><title>个人中心</title></Helmet>
      <div className={style.topWrapper}><HederWithBack /></div>
      <div className={style.meWrapper}>
        <Top navData={navData} />
        <div className={style.links}>
          <VideoLinks uid={navData?.mid} />
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
          <div className={style.messageCenter}>
            <span>消息中心</span>
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

export default Index;
