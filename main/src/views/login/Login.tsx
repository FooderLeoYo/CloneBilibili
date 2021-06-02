import * as React from "react";
import { Helmet } from "react-helmet";

import { exitLogin } from "../../api/space";

import Head from "./child-components/head/Head";
import openEyesPic from "../../assets/images/login-open-eyes.png";
import closeEyesPic from "../../assets/images/login-close-eyes.png";

import SMS from "./child-components/sms/SMS";
import Password from "./child-components/password/Password";

import style from "./login.styl?css-modules";

const { useState } = React;

function Login() {
  const [loginType, setLoginType] = useState("短信登录");
  const [openEyes, setOpenEyes] = useState(true);

  return (
    <div className="login">
      <Helmet><title>登录/注册</title></Helmet>
      <div className={style.loginWrapper}>
        <Head loginType={loginType} setLoginType={setLoginType} />
        <div onClick={() => exitLogin()}>注销登录</div>
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
