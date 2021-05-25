import * as React from "react";
import JSEncrypt from 'jsencrypt'

import { getGTCaptcha, getPWKeyAndHash, getPWVerifyInfo } from "../../../../api/login";

import CleanText from "../../../../components/clean/CleanText"
import Toast from "../../../../components/toast/index";

import style from "./password.styl?css-modules";

declare global {
  interface Window {
    initGeetest: Function;
  }
}

interface PasswordProps {
  setOpenEyes: React.Dispatch<React.SetStateAction<boolean>>;
  setLoginType: React.Dispatch<React.SetStateAction<string>>;
}

const { useRef, useEffect, useState } = React;

function Password(props: PasswordProps) {
  const { setOpenEyes, setLoginType } = props;

  const accountRef: React.MutableRefObject<HTMLInputElement> = useRef(null);
  const passwordRef: React.MutableRefObject<HTMLInputElement> = useRef(null);
  const loginBtnRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const signupBtnRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  const [accountValue, setAccountValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  let loginKey;
  let challengeValue;

  function geetestHandler(captchaObj) {
    captchaObj.onReady(() => {
      Toast.hide();
      captchaObj.verify();
    }).onSuccess(() => {
      const { geetest_validate, geetest_seccode } = captchaObj.getValidate();

      getPWKeyAndHash().then(pwRes => {
        const { code, data } = pwRes;

        if (code === 0) {
          Toast.warning('哇！服务器太忙了，您稍等片刻昂o(TヘTo)', false, null, 2000);
        } else {
          const { key, hash } = data;
          const encryptor = new JSEncrypt({});  // 创建加密对象实例
          encryptor.setPublicKey(key);//设置公钥
          const rsaPassWord = encryptor.encrypt(hash + passwordRef.current.value);  // 对内容进行加密
          const param = {
            captchaType: 6,
            username: accountRef.current.value,
            password: rsaPassWord,
            keep: true,
            key: loginKey,
            challenge: challengeValue,
            validate: geetest_validate,
            seccode: geetest_seccode
          }

          Toast.loading("正在登录，请稍等……");
          getPWVerifyInfo(param).then(res => {
            const { code, data } = res;

            Toast.hide();
            if (code === 0) {
              Toast.warning('哇！服务器太忙了，您稍等片刻昂o(TヘTo)', false, null, 2000);
            } else {
              const { code, message } = data;

              if (code === 0) {
                // 登录成功后的操作
              } else { Toast.error(message, false, null, 2000); }
            }
          })
        }
      });
    });
  }

  function getRobertTestCap() {
    getGTCaptcha().then(capData => {
      const { code, data } = capData;

      if (code === 0) {
        Toast.warning('哇！服务器太忙了，您稍等片刻昂o(TヘTo)', false, null, 2000);
      } else {
        const { gt, challenge, key } = data.result;
        loginKey = key;
        challengeValue = challenge;

        Toast.loading("人机验证加载中……");
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
      }
    });
  }

  function checkAccountFormat() {
    const account = accountRef.current.value;
    const phoneReg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    const emailReg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
    return phoneReg.test(account) || emailReg.test(account)
  }

  function ableLoginBtn() {
    if (checkAccountFormat() && passwordRef.current.value.length > 5) {
      loginBtnRef.current.classList.add(style.able);
    } else {
      loginBtnRef.current.classList.remove(style.able);
    }
  }

  useEffect(() => {
    passwordRef.current.addEventListener("focus", () => setOpenEyes(false));
    passwordRef.current.addEventListener("blur", () => setOpenEyes(true));
    loginBtnRef.current.addEventListener("click", () => getRobertTestCap());
    signupBtnRef.current.addEventListener("click", () => setLoginType("短信登录"));
  }, []);


  return (
    <div className={style.pwWrapper}>
      <ul className={style.inputWrapper}>
        <li className={style.accountWrapper}>
          <span className={style.accountTittle}>账号</span>
          <input
            className={style.phoneValue}
            type="text"
            placeholder="请输入手机号/邮箱"
            autoComplete="on"
            ref={accountRef}
            onChange={e => {
              ableLoginBtn();
              setAccountValue(e.currentTarget.value);
            }}
          />
          <CleanText
            inputValue={accountValue}
            inputDOMRef={accountRef}
            clickMethods={() => loginBtnRef.current.classList.remove(style.able)}
          />
        </li>
        <li className={style.passwordWrapper}>
          <span className={style.passwordTittle}>密码</span>
          <input
            className={style.passwordValue}
            type="password"
            placeholder="请输入密码"
            autoComplete="off"
            maxLength={20}
            ref={passwordRef}
            onChange={e => {
              ableLoginBtn();
              setPasswordValue(e.currentTarget.value);
            }}
          />
          <CleanText
            inputValue={passwordValue}
            inputDOMRef={passwordRef}
            clickMethods={() => loginBtnRef.current.classList.remove(style.able)}
          />
        </li>
      </ul>
      <div className={style.forget}>
        <span onClick={() => alert("找回密码")}>忘记密码？</span>
      </div>
      <div className={style.btnWrapper}>
        <div className={style.signup} ref={signupBtnRef}>注册</div>
        <div className={style.login} ref={loginBtnRef}>登录</div>
      </div>
      <div className={style.protocolsWrapper}>
        登录即代表你同意
        <span onClick={() => alert("用户协议")}>用户协议</span>
        和
        <span onClick={() => alert("隐私政策")}>隐私政策</span>
      </div>
    </div>
  )
}

export default Password;