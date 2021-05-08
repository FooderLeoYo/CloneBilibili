import * as React from "react";
import JSEncrypt from 'jsencrypt'

import { getGTCaptcha, getPWKeyAndHash, getLoginVerifyInfo } from "../../../../api/login";

import style from "./password.styl?css-modules";

declare global {
  interface Window {
    initGeetest: Function;
  }
}

interface IndexProps {
}

const { useRef, useEffect } = React;

function Password(props: IndexProps) {
  const loginBtnRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const toGTCapRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const continueRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const usernameRef: React.MutableRefObject<HTMLInputElement> = useRef(null);
  const passwordRef: React.MutableRefObject<HTMLInputElement> = useRef(null);

  let loginKey;
  let challengeValue;

  function geetestHandler(captchaObj) {
    captchaObj.onReady(() => captchaObj.verify())
      .onSuccess(() => {
        const { geetest_validate, geetest_seccode } = captchaObj.getValidate();

        getPWKeyAndHash().then(pwRes => {
          const { key, hash } = pwRes.data;
          const encryptor = new JSEncrypt({});  // 创建加密对象实例
          encryptor.setPublicKey(key);//设置公钥
          const rsaPassWord = encryptor.encrypt(hash + passwordRef.current.value);  // 对内容进行加密
          const param = {
            captchaType: 6,
            username: usernameRef.current.value,
            password: rsaPassWord,
            keep: true,
            key: loginKey,
            challenge: challengeValue,
            validate: geetest_validate,
            seccode: geetest_seccode
          }

          getLoginVerifyInfo(param).then(res => {
            const { code, json } = res;
            if (code === 0) {
              // console.log("哇！服务器太忙了，您稍等片刻昂……");
              console.log("本地服务器出错");
            } else {
              const { code, data, message } = json;
              if (data) {
                console.log("登陆成功");
              } else if (message.length > 0) {
                console.log(message);
              } else {
                switch (code) {
                  case -629:
                    console.log("账号或密码错误");
                    break;
                  case -653:
                    console.log("用户名或密码不能为空");
                    break;
                  case -662:
                    console.log("提交超时,请重新提交");
                    break;
                  case -2100:
                    console.log("需验证手机号或邮箱");
                    break;
                  case -2001:
                    console.log("缺少必要的的参数");
                    break;
                  case 2400:
                    console.log("登录秘钥错误");
                    break;
                  case 2406:
                    console.log("验证极验服务出错");
                    break;
                  default:
                    console.log("哇！服务器太忙了，您稍等片刻昂……");
                    break;
                }
              }
            }
          })
        });
      });
  }

  function getRobertTestCap() {
    getGTCaptcha().then(capData => {
      const { gt, challenge, key } = capData.data.result;
      loginKey = key;
      challengeValue = challenge;

      // 调用 initGeetest 进行初始化
      window.initGeetest({
        // 以下 4 个配置参数为必须，不能缺少
        gt: gt,
        challenge: challenge,
        offline: false, // 表示用户后台检测极验服务器是否宕机
        new_captcha: true, // 用于宕机时表示是新验证码的宕机

        product: "bind", // 验证图弹出形式
        https: true
      }, geetestHandler);
    });
  }

  useEffect(() => {
    loginBtnRef.current.addEventListener("click", () => { getRobertTestCap(); });
  }, []);

  return (
    <>
      <ul className={style.loginInfo}>
        <li className={style.account}>
          <div>
            <span>账号</span>
            <input type="text" placeholder="请输入手机号/邮箱" autoComplete="on" ref={usernameRef} />
          </div>
        </li>
        <li className={style.password}>
          <div>
            <span >密码</span>
            <input type="password" placeholder="请输入密码" autoComplete="on" maxLength={20} ref={passwordRef} />
          </div>
        </li>
      </ul>
      <div ref={loginBtnRef}>你是机器人嘛 (′⌒` )</div>
      <div className={style.captchaWrapper} ref={toGTCapRef}></div>
      <div ref={continueRef}>继续登录</div>
    </>
  )
}

export default Password;