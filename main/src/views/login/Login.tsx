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
      <div onClick={() => Toast.show('啊啊啊啊啊啊啊啊', false, "", () => alert("回调"), 2000)}>show</div>
      <div onClick={() => Toast.info('啊啊啊啊啊啊啊啊', false, "", null, 50000)}>info</div>
      <div onClick={() => Toast.success('啊啊啊啊啊啊啊啊', false, "", null, 2000)}>success</div>
      <div onClick={() => Toast.warning('啊啊啊啊啊啊啊啊', false, "", null, 2000)}>warning</div>
      <div onClick={() => Toast.error('啊啊啊啊啊啊啊啊', false, "", null, 2000)}>error</div>
      <div onClick={() => Toast.loading('啊啊啊啊啊啊啊啊')}>loading</div>
      <div onClick={() => Toast.hide()}>hide</div>
      {openEyes ? <img className={style.loginPic} src={openEyesPic} alt="开眼" /> : <img className={style.loginPic} src={closeEyesPic} alt="闭眼" />}
      {
        loginType === "短信登录" ? <SMS setOpenEyes={setOpenEyes} /> :
          <Password setOpenEyes={setOpenEyes} setLoginType={setLoginType} />
      }
    </div>
  );
}

export default Login;
