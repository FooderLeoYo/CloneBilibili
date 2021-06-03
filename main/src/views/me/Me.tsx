import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { getNavUserInfo } from "../../api/login";
import { exitLogin } from "../../api/me";

import HederWithBack from "../../components/header-with-back/HederWithBack";
import BasicInfo from "./child-components/basic-info/BasicInfo"

import style from "./me.styl?css-modules";

const { useState, useEffect } = React;

function Me() {
  const [navData, setNavData] = useState(null);

  useEffect(() => {
    getNavUserInfo().then(res => {
      const { code, data } = res.data;
      console.log(data)
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
        <BasicInfo navData={navData} />
        <div className={style.viewed}>观看过的相关</div>
        <div className={style.collections}>收藏相关</div>
        <div className={style.asset}>资产相关</div>
        <div className={style.profile}>个人资料</div>
        <div className={style.security}>安全</div>
        <div className={style.exitLogin} onClick={() => exitLogin()}>注销登录</div>
      </div>
    </div>
  )
}

export default Me;