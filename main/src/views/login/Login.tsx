import * as React from "react";
import { Helmet } from "react-helmet";

import { getNavUserInfo, exitLogin } from "../../api/login";

import Head from "./child-components/head/Head";
import openEyesPic from "../../assets/images/login-open-eyes.png";
import closeEyesPic from "../../assets/images/login-close-eyes.png";

import SMS from "./child-components/sms/SMS";
import Password from "./child-components/password/Password";

import style from "./login.styl?css-modules";

import Toast from "../../components/toast/index";

interface LoginProps {
}

const { useState, useEffect } = React;

function Login(props: LoginProps) {
  const [loginType, setLoginType] = useState("短信登录");
  const [openEyes, setOpenEyes] = useState(true);

  useEffect(() => {
    // getNavUserInfo().then(res => console.log(res));
  }, []);

  return (
    <div className="login">
      <Helmet><title>登录/注册</title></Helmet>
      <div className={style.loginWrapper}>
        <Head loginType={loginType} setLoginType={setLoginType} />
        <div onClick={() => Toast.info('啊啊啊啊啊啊啊啊', false, null, 50000)}>info</div>
        <div onClick={() => Toast.success('啊啊啊啊啊啊啊啊', false, null, 2000)}>success</div>
        <div onClick={() => Toast.warning('啊啊啊啊啊啊啊啊', false, null, 2000)}>warning</div>
        <div onClick={() => Toast.error('啊啊啊啊啊啊啊啊', false, null, 2000)}>error</div>
        <div onClick={() => Toast.noAni('啊啊啊啊啊啊啊啊', false, "", () => alert("回调"), 2000)}>noAni</div>
        <div onClick={() => Toast.hide()}>hide</div>
        <div onClick={() => exitLogin()}>注销登录</div>
        <div onClick={() => Toast.loading()}>loading</div>
        {openEyes ? <img className={style.loginPic} src={openEyesPic} alt="开眼" /> : <img className={style.loginPic} src={closeEyesPic} alt="闭眼" />}
        {
          loginType === "短信登录" ? <SMS setOpenEyes={setOpenEyes} /> :
            <Password setOpenEyes={setOpenEyes} setLoginType={setLoginType} />
        }
      </div>
    </div>
  );
}

export default Login;
