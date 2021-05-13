import * as React from "react";

import { getAreaCode } from "../../../../api/login";

import Overlay from "./child-components/overlay/Overlay";

import style from "./sms.styl?css-modules";

interface SMSProps {
}

const { useState, useRef, useEffect } = React;

function SMS(props: SMSProps) {

  const [curAreaInx, setCurAreaInx] = useState(0);
  const [allArea, setAllArea] = useState([]);
  const [areaOpts, setAreaOpts] = useState([]);
  const [areaCode, setAreaCode] = useState("86");

  const moreRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const areaBoxRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const hideAreaBoxRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const overlayRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const phoneRef: React.MutableRefObject<HTMLInputElement> = useRef(null);

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
          }}
        >{area.cname}</li>
      ));

      setAreaOpts(list);
    }
  }, [allArea]);

  return (
    <>
      <ul className={style.smsWrapper}>
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
          <div className={style.areaBox} ref={areaBoxRef}>
            <div className={style.tittle}>地区选择</div>
            <ul className={style.options}>{areaOpts}</ul>
            <div className={style.cancel} ref={hideAreaBoxRef}>取消</div>
          </div>
          <div className={style.overlayWrapper} ref={overlayRef}><Overlay /></div>
        </li>
        {/* 手机号码 */}
        <li className={style.number}>
          <span>{`+${areaCode}`}</span>
          {/* <input
            type="text"
            placeholder="请输入手机号/邮箱"
            autoComplete="on"
            ref={phoneRef}
            onChange={e => setAccountValue(e.currentTarget.value)}
          /> */}
        </li>
        {/* 短信验证码 */}
        <li className={style.message}></li>
      </ul>
    </>
  )
}

export default SMS;
