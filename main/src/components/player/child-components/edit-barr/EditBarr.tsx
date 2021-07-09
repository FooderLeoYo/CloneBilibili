import * as React from "react";

import { sendBarrage } from "@api/video";
import CleanText from "@root/src/components/clean-text/CleanText"

import style from "./edit-barr.styl?css-modules";

interface EditBarrProps {
  showEditBarr: boolean;
  setShowEditBarr: React.Dispatch<React.SetStateAction<boolean>>;
  videoData: any;
  barrageRef: React.RefObject<any>;
}

const { useState, useRef } = React;

function EditBarr(props: EditBarrProps) {
  const { showEditBarr, setShowEditBarr, videoData, barrageRef } = props;
  const { aId, cId } = videoData;
  const [barrSize, setBarrSize] = useState(25); // 标准（25）、小（18）
  const [barrPosition, setBarrPosition] = useState(1); // 滚动（1）、底部（4）、顶部（5）
  const [barrColor, setBarrColor] = useState(16777215); // 十进制RGB888值，默认#fff
  const barrInputRef: React.MutableRefObject<HTMLInputElement> = useRef(null);
  const accountCleantRef: React.MutableRefObject<any> = useRef(null);

  const sendBarr = () => {
    const timestamp = Date.now();
    sendBarrage(aId, barrPosition, barrInputRef.current.value, cId, timestamp, 1,
      barrColor, barrPosition).then(result => {
        if (result.code === "1") {
          // 由于发送成功后也要等5s左右才能获取到新发弹幕数据，故这里直接发一个“假”的
          barrageRef.current.send({
            content: barrInputRef.current.value,
            type: barrPosition,
            decimalColor: barrColor,
            sendTime: timestamp,
            isMineBarr: true
          });
          setShowEditBarr(false);
        }
      });
  }

  return (
    <div className={style.editBarr + (showEditBarr ? " " + style.show : "")}>
      <div className={style.sendBox}>
        <span className={style.cancelBtn} onClick={() => setShowEditBarr(false)}>x</span>
        <div className={style.inputWrapper}>
          <input className={style.barrInput} type="text" ref={barrInputRef}
            placeholder="发个弹幕见证当下"
            onChange={e => accountCleantRef.current.checkIfShow(e.currentTarget.value)}
          />
          <CleanText inputDOMRef={barrInputRef} ref={accountCleantRef} />
        </div>
        <span className={style.sendBtn} onClick={sendBarr}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-paperPlane"></use>
          </svg>
        </span>
      </div>
      <ul className={style.editArea}>
        <li className={style.optCategery}>
          <span className={style.name}>弹幕字号</span>
          <ul className={style.options}>
            <li className={style.wordOpt + (barrSize === 25 ? " " + style.current : "")} onClick={() => setBarrSize(25)}>标准</li>
            <li className={style.wordOpt + (barrSize === 18 ? " " + style.current : "")} onClick={() => setBarrSize(18)}>小</li>
          </ul>
        </li>
        <li className={style.optCategery}>
          <span className={style.name}>弹幕位置</span>
          <ul className={style.options}>
            <li className={style.wordOpt + (barrPosition === 1 ? " " + style.current : "")} onClick={() => setBarrPosition(1)}>滚动</li>
            <li className={style.wordOpt + (barrPosition === 5 ? " " + style.current : "")} onClick={() => setBarrPosition(5)}>顶部</li>
            <li className={style.wordOpt + (barrPosition === 4 ? " " + style.current : "")} onClick={() => setBarrPosition(4)}>底部</li>
          </ul>
        </li>
        <li className={style.editColor}>
          <span className={style.colorName}>弹幕颜色</span>
          <ul className={style.colorOpts}>
            <li className={style.white + (barrColor === 16777215 ? " " + style.current : "")} onClick={() => setBarrColor(16777215)} />
            <li className={style.red + (barrColor === 16646914 ? " " + style.current : "")} onClick={() => setBarrColor(16646914)} />
            <li className={style.orange + (barrColor === 16740868 ? " " + style.current : "")} onClick={() => setBarrColor(16740868)} />
            <li className={style.lightOra + (barrColor === 16755202 ? " " + style.current : "")} onClick={() => setBarrColor(16755202)} />
            <li className={style.yellow + (barrColor === 16765698 ? " " + style.current : "")} onClick={() => setBarrColor(16765698)} />
            <li className={style.lemon + (barrColor === 16776960 ? " " + style.current : "")} onClick={() => setBarrColor(16776960)} />
            <li className={style.grass + (barrColor === 10546688 ? " " + style.current : "")} onClick={() => setBarrColor(10546688)} />
            <li className={style.leaf + (barrColor === 52480 ? " " + style.current : "")} onClick={() => setBarrColor(52480)} />
            <li className={style.lake + (barrColor === 104601 ? " " + style.current : "")} onClick={() => setBarrColor(104601)} />
            <li className={style.blue + (barrColor === 4351678 ? " " + style.current : "")} onClick={() => setBarrColor(4351678)} />
            <li className={style.sky + (barrColor === 9033215 ? " " + style.current : "")} onClick={() => setBarrColor(9033215)} />
            <li className={style.purple + (barrColor === 13369971 ? " " + style.current : "")} onClick={() => setBarrColor(13369971)} />
            <li className={style.black + (barrColor === 2236962 ? " " + style.current : "")} onClick={() => setBarrColor(2236962)} />
            <li className={style.gray + (barrColor === 10197915 ? " " + style.current : "")} onClick={() => setBarrColor(10197915)} />
          </ul>
        </li>
      </ul>
    </div>
  )
}

export default EditBarr;