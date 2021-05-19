import * as React from "react";

import { getNavUserInfo } from "../../api/login";

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
    getNavUserInfo().then(res => console.log(res));
  }, []);

  return (
    <div className={style.loginWrapper}>
      <Head loginType={loginType} setLoginType={setLoginType} />
      {/* <button onClick={() => Toast.warning('啊啊啊啊啊啊啊啊', true, "", null, 5000)}>点击</button> */}
      <button onClick={() => Toast.loading()}>点击</button>
      {openEyes ? <img className={style.loginPic} src={openEyesPic} alt="开眼" /> : <img className={style.loginPic} src={closeEyesPic} alt="闭眼" />}
      {
        loginType === "短信登录" ?
          <SMS setOpenEyes={setOpenEyes} /> :
          <Password setOpenEyes={setOpenEyes} setLoginType={setLoginType} />
      }
    </div>
  );
}

export default Login;
