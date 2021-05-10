import * as React from "react";

import { getNavUserInfo } from "../../api/login";

import Head from "./child-components/head/Head";
import SMS from "./child-components/sms/SMS";
import Password from "./child-components/password/Password";

import style from "./login.styl?css-modules";

interface LoginProps {
}

const { useState, useEffect } = React;

function Login(props: LoginProps) {
  const [loginType, setLoginType] = useState("短信登陆");
  const [openEyes, setOpenEyes] = useState(true);

  useEffect(() => {
    getNavUserInfo().then(res => console.log(res));
  }, []);

  return (
    <div className={style.loginWrapper}>
      <Head loginType={loginType} setLoginType={setLoginType} />
      {openEyes ? <div>开眼</div> : <div>闭眼</div>}
      { loginType === "短信登陆" ? <SMS /> : <Password />}
    </div>
  );
}

export default Login;
