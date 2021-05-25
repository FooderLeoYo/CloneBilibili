import * as React from "react";

import { getAreaCode, getGTCaptcha, getCaptcha, getSMSVerifyInfo } from "../../../../api/login";

import CleanText from "../../../../components/clean/CleanText"
import Overlay from "./child-components/overlay/Overlay";
import Toast from "../../../../components/toast/index";

import style from "./sms.styl?css-modules";

interface SMSProps {
  setOpenEyes: React.Dispatch<React.SetStateAction<boolean>>;
}

const { useState, useRef, useEffect } = React;

function SMS(props: SMSProps) {
  const { setOpenEyes } = props;

  const [curAreaInx, setCurAreaInx] = useState(0);
  const [allArea, setAllArea] = useState([]);
  const [cid, setCid] = useState(1);
  const [areaOpts, setAreaOpts] = useState([]);
  const [areaCode, setAreaCode] = useState("86");
  const [phoneValue, setPhoneValue] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");

  const moreRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const areaBoxRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const hideAreaBoxRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const overlayRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const phoneRef: React.MutableRefObject<HTMLInputElement> = useRef(null);
  const captchaRef: React.MutableRefObject<HTMLInputElement> = useRef(null);
  const getCapRef: React.MutableRefObject<HTMLSpanElement> = useRef(null);
  const verifyBtnRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  function checkPhoneFormat() {
    const phoneNum = phoneRef.current.value;
    const phoneReg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    return phoneReg.test(phoneNum);
  }

  function checkSMSFormat() {
    const smsCaptcha = captchaRef.current.value;
    const captchaReg = /^\d{6}\b/;
    return captchaReg.test(smsCaptcha);
  }

  let loginKey;
  let challengeValue;
  function geetestHandler(captchaObj) {
    captchaObj.onReady(() => {
      Toast.hide();
      captchaObj.verify();
    }).onSuccess(() => {
      const { geetest_validate, geetest_seccode } = captchaObj.getValidate();
      const getCapParam = {
        tel: phoneRef.current.value,
        cid: cid,
        type: 21,
        captchaType: 6,
        key: loginKey,
        challenge: challengeValue,
        validate: geetest_validate,
        seccode: geetest_seccode
      }

      getCaptcha(getCapParam).then(res => {
        const { code, data } = res;
        if (code === 0) {
          Toast.warning('哇！服务器太忙了，您稍等片刻昂o(TヘTo)', false, null, 2000);
        } else {
          const { code, message } = data;

          if (code === 0) {
            Toast.success(message, false, null, 2000);
            verifyBtnRef.current.addEventListener("click", () => {
              const verifySMSParam = {
                cid: cid,
                tel: phoneRef.current.value,
                smsCode: captchaRef.current.value
              }

              Toast.loading("正在登录，请稍等……");
              getSMSVerifyInfo(verifySMSParam).then(res => {
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
            });
          } else { Toast.error(message, false, null, 2000); }
        }

      })
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

  function ableLoginBtn() {
    if (checkPhoneFormat() && checkSMSFormat()) {
      verifyBtnRef.current.classList.add(style.able);
    } else {
      verifyBtnRef.current.classList.remove(style.able);
    }
  }

  const [canSend, setCanSend] = useState(true);
  const [cooldown, setCooldown] = useState(60);
  const cooldownRef: React.MutableRefObject<number> = useRef(60);
  useEffect(() => { cooldownRef.current = cooldown; }, [cooldown]);
  let countdownTimer: number;
  let resetTimer: number;
  function handleGetCapClick() {
    if (canSend) {
      if (!checkPhoneFormat()) {
        Toast.error('手机号码格式不正确，请检查后重新输入', false, null, 2000)
      } else {
        const getCapDOM = getCapRef.current;

        getRobertTestCap();
        getCapDOM.classList.add(style.disable);
        setCanSend(false);

        countdownTimer = setInterval(() => {
          const newTime = cooldownRef.current - 1;
          getCapDOM.innerText = `${newTime}s后重试`;
          setCooldown(newTime);
        }, 1000);
        resetTimer = setTimeout(() => {
          getCapDOM.classList.remove(style.disable);
          getCapDOM.innerText = "获取验证码";
          clearInterval(countdownTimer);
          setCanSend(true);
          setCooldown(60);
        }, 60000);
      }
    }
  }

  useEffect(() => {
    getAreaCode().then(res => {
      const { code, data } = res;
      if (code === 0) {
        Toast.warning('哇！服务器太忙了，您稍等片刻昂o(TヘTo)', false, null, 2000);
      } else { setAllArea(data.common.concat(res.data.others)); }
    });

    moreRef.current.addEventListener("click", () => {
      areaBoxRef.current.classList.add(style.show);
      overlayRef.current.classList.add(style.show);
    });
    hideAreaBoxRef.current.addEventListener("click", () => {
      areaBoxRef.current.classList.remove(style.show);
      overlayRef.current.classList.remove(style.show);
    });
    overlayRef.current.addEventListener("touchmove", e => e.preventDefault());

    getCapRef.current.addEventListener("click", () => handleGetCapClick());

    captchaRef.current.addEventListener("focus", () => setOpenEyes(false));
    captchaRef.current.addEventListener("blur", () => setOpenEyes(true));
  }, []);

  useEffect(() => {
    if (allArea.length > 0) {
      const boxClass = areaBoxRef.current.classList;
      const list = allArea.map((area, index) => (
        <li
          key={index}
          onClick={() => {
            boxClass.remove(style.show);
            overlayRef.current.classList.remove(style.show);
            setCurAreaInx(index);
            setAreaCode(area.country_id);
            setCid(area.id);
          }}
        >{area.cname}</li>
      ));

      setAreaOpts(list);
    }
  }, [allArea]);

  return (
    <div className={style.smsWrapper}>
      <ul className={style.inputWrapper}>
        {/* 选择地区 */}
        <li className={style.areaWrapper}>
          <div className={style.areaForm}>
            <span className={style.areaName}>{allArea[curAreaInx]?.cname}</span>
            <div className={style.more} ref={moreRef}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-moreNoFill"></use>
              </svg>
            </div>
          </div>
          <div className={style.optionsBox} ref={areaBoxRef}>
            <div className={style.tittle}>选择国家地区</div>
            <ul className={style.options}>{areaOpts}</ul>
            <div className={style.cancel} ref={hideAreaBoxRef}>取消</div>
          </div>
          <div className={style.overlayWrapper} ref={overlayRef}><Overlay /></div>
        </li>
        {/* 手机号码 */}
        <li className={style.phoneWrapper}>
          <span className={style.areaCode}>{`+${areaCode}`}</span>
          <input
            className={style.phoneValue}
            type="tel"
            placeholder="请输入常用手机号"
            autoComplete="on"
            maxLength={16}
            ref={phoneRef}
            onChange={e => {
              ableLoginBtn();
              setPhoneValue(e.currentTarget.value);
            }}
          />
          <CleanText
            inputValue={phoneValue}
            inputDOMRef={phoneRef}
            clickMethods={() => verifyBtnRef.current.classList.remove(style.able)}
          />
          <span className={style.getCaptcha} ref={getCapRef}>获取验证码</span>
        </li>
        {/* 短信验证码 */}
        <li className={style.captchaWrapper}>
          <span className={style.captchaTittle}>验证码</span>
          <input
            className={style.captchaValue}
            type="tel"
            placeholder="请输入验证码"
            autoComplete="off"
            maxLength={6}
            ref={captchaRef}
            onChange={e => {
              ableLoginBtn();
              setCaptchaValue(e.currentTarget.value);
            }}
          />
          <CleanText
            inputValue={captchaValue}
            inputDOMRef={captchaRef}
            clickMethods={() => verifyBtnRef.current.classList.remove(style.able)}
          />
        </li>
      </ul>
      <div className={style.verify} ref={verifyBtnRef}>验证登录</div>
      <div className={style.bottomWrapper}>
        <div className={style.tip}>未注册或未绑定哔哩哔哩的手机号，将帮你注册新账号</div>
        <div className={style.protocolsWrapper}>
          登录即代表你同意<span onClick={() => alert("用户协议")}>用户协议</span>
          和<span onClick={() => alert("隐私政策")}>隐私政策</span>
        </div>
      </div>
    </div>
  )
}

export default SMS;
