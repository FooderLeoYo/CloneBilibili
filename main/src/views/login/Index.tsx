import * as React from "react";
import JSEncrypt from 'jsencrypt'
import axios from "axios";
import qs from "qs";

import { getGTCaptcha, getPWKeyAndHash, getLoginVerifyInfo } from "../../api/login";

import style from "./index.styl?css-modules";

declare global {
  interface Window {
    initGeetest: Function;
  }
}

interface IndexProps {
}

const { useEffect, useRef } = React;

function Index(props: IndexProps) {
  const loginBtnRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const toGTCapRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const continueRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const usernameRef: React.MutableRefObject<HTMLInputElement> = useRef(null);
  const passwordRef: React.MutableRefObject<HTMLInputElement> = useRef(null);

  let challengeValue;

  function geetestHandler(captchaObj) {
    captchaObj.appendTo(toGTCapRef.current);

    continueRef.current.addEventListener("click", () => {
      const { geetest_validate, geetest_seccode } = captchaObj.getValidate();

      getPWKeyAndHash().then(pwRes => {
        const { key, hash } = pwRes.data;
        // let ketTest = "-----BEGIN PUBLIC KEY-----" +
        //   "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDjb4V7EidX/ym28t2ybo0U6t0n" +
        //   "6p4ej8VjqKHg100va6jkNbNTrLQqMCQCAYtXMXXp2Fwkk6WR+12N9zknLjf+C9sx" +
        //   "/+l48mjUU8RqahiFD1XT/u2e0m2EN029OhCgkHx3Fc/KlFSIbak93EH/XlYis0w+" +
        //   "Xl69GV6klzgxW6d2xQIDAQAB" +
        //   "-----END PUBLIC KEY-----";

        const encryptor = new JSEncrypt({});  // 创建加密对象实例
        encryptor.setPublicKey(key);//设置公钥
        const rsaPassWord = encryptor.encrypt(hash + passwordRef.current.value);  // 对内容进行加密
        // const rsaPassWord = "YgpjxAQ22pKa9socHIKPCZX0a/NS6Ng9Zzy+rp16b0LJGT6RHw2ERs3+ijCpG96PKTY1Baavwf0xgotmNvpl25l1KO5y4AjcqeWTzNTSVn6ejonBXGmBMybHHYawJ0aMPn1eDGpKrbI91mrF+h2x+fsnnpuZ1gheiYGzFmtshUc="

        const param = {
          captchaType: 6,
          username: usernameRef.current.value,
          password: rsaPassWord,
          keep: true,
          key: key,
          challenge: challengeValue,
          validate: geetest_validate,
          seccode: geetest_seccode,
        }
        // const param = {
        //   source: "main_h5",
        //   token: "86e0d602201a412488691525f3c95693",
        //   username: usernameRef.current.value,
        //   password: rsaPassWord,
        //   keep: true,
        //   key: key,
        //   go_url: "https://www.bilibili.com/",
        //   validate: geetest_validate,
        //   seccode: geetest_seccode,
        // }

        getLoginVerifyInfo(param)
        // .then(res => console.log(res))
      });

    });
  }

  function getRobertTestCap() {
    getGTCaptcha().then(capData => {
      const { gt, challenge } = capData.data.result;

      challengeValue = challenge;
      // 调用 initGeetest 进行初始化
      window.initGeetest({
        // 以下 4 个配置参数为必须，不能缺少
        gt: gt,
        challenge: challenge,
        offline: false, // 表示用户后台检测极验服务器是否宕机
        new_captcha: true, // 用于宕机时表示是新验证码的宕机

        product: "popup", // 产品形式，包括：float，popup
        width: "300px",
        https: true
      }, geetestHandler);
    });
  }

  useEffect(() => {
    loginBtnRef.current.addEventListener("click", () => { getRobertTestCap(); });
  }, []);

  return (
    <div >
      <ul className={style.loginInfo}>
        <li className={style.account}>
          <div>
            <span>账号</span>
            <input type="text" placeholder="你的手机号/邮箱" autoComplete="on" ref={usernameRef} />
          </div>
        </li>
        <li className={style.password}>
          <div>
            <span >密码</span>
            <input type="password" placeholder="你的手机号/邮箱" autoComplete="on" maxLength={20} ref={passwordRef} />
          </div>
        </li>
      </ul>
      <div ref={loginBtnRef}>登录</div>
      <div ref={toGTCapRef}></div>
      <div ref={continueRef}>继续登录</div>
    </div>
  );
}

export default Index;
