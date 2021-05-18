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
  const [loginType, setLoginType] = useState("短信登陆");
  const [openEyes, setOpenEyes] = useState(true);

  useEffect(() => {
    getNavUserInfo().then(res => console.log(res));
    Toast.info('啊啊啊啊啊啊啊啊', 5000);
  }, []);

  return (
    <div className={style.loginWrapper}>
      <Head loginType={loginType} setLoginType={setLoginType} />
      {openEyes ? <img className={style.loginPic} src={openEyesPic} alt="开眼" /> : <img className={style.loginPic} src={closeEyesPic} alt="闭眼" />}
      { loginType === "短信登陆" ? <SMS setOpenEyes={setOpenEyes} /> : <Password setOpenEyes={setOpenEyes} />}
    </div>
  );
}

export default Login;
