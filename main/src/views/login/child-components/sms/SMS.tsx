import * as React from "react";

import { getAreaCode, getGTCaptcha, getCaptcha, getSMSVerifyInfo } from "../../../../api/login";

import Clean from "../../../../components/clean/CleanText"
import Overlay from "./child-components/overlay/Overlay";

import style from "./sms.styl?css-modules";

interface SMSProps {
}

const { useState, useRef, useEffect } = React;

function SMS(props: SMSProps) {

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

  let loginKey;
  let challengeValue;

  function geetestHandler(captchaObj) {
    captchaObj.onReady(() => captchaObj.verify())
      .onSuccess(() => {
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
          console.log(res.message)
          verifyBtnRef.current.addEventListener("click", () => {
            const verifySMSParam = {
              cid: cid,
              tel: phoneRef.current.value,
              smsCode: captchaRef.current.value
            }
            console.log(verifySMSParam)
            getSMSVerifyInfo(verifySMSParam).then(res => console.log(res))
          });
        })
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

  function checkFormat() {
    const phoneNum = phoneRef.current.value;
    const smsCaptcha = captchaRef.current.value;
    const phoneReg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    const captchaReg = /^\d{6}\b/;

    if (captchaReg.test(smsCaptcha) && phoneReg.test(phoneNum)) {
      verifyBtnRef.current.classList.add(style.able);
    } else {
      verifyBtnRef.current.classList.remove(style.able);
    }
  }

  useEffect(() => {
    moreRef.current.addEventListener("click", () => {
      areaBoxRef.current.classList.add(style.show);
      overlayRef.current.classList.add(style.show);
    });
    hideAreaBoxRef.current.addEventListener("click", () => {
      areaBoxRef.current.classList.remove(style.show);
      overlayRef.current.classList.remove(style.show);
    });
    overlayRef.current.addEventListener("touchmove", e => e.preventDefault());

    getCapRef.current.addEventListener("click", () => getRobertTestCap());

    getAreaCode().then(res => setAllArea(res.data.common.concat(res.data.others)));
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
            autoComplete="off"
            maxLength={16}
            ref={phoneRef}
            onChange={e => {
              checkFormat();
              setPhoneValue(e.currentTarget.value);
            }}
          />
          <Clean
            inputValue={phoneValue}
            inputDOMRef={phoneRef}
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
              checkFormat();
              setCaptchaValue(e.currentTarget.value);
            }}
          />
          <Clean
            inputValue={captchaValue}
            inputDOMRef={captchaRef}
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
