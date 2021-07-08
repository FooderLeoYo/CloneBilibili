import * as React from "react";

import CleanText from "@root/src/components/clean-text/CleanText"

import style from "./edit-barr.styl?css-modules";

interface EditBarrProps {
  showEditBarr: boolean;
  setShowEditBarr: React.Dispatch<React.SetStateAction<boolean>>;
}

const { useState, useRef } = React;

function EditBarr(props: EditBarrProps) {
  const { showEditBarr, setShowEditBarr } = props;

  const [barrSize, setBarrSize] = useState(25); // 标准（25）、小（18）
  const [barrPosition, setBarrPosition] = useState(1); // 滚动（1）、底部（4）、顶部（5）
  const [barrColor, setBarrColor] = useState(16777215); // 十进制RGB888值，默认#fff

  const barrInputRef: React.MutableRefObject<HTMLInputElement> = useRef(null);
  const accountCleantRef: React.MutableRefObject<any> = useRef(null);

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
        <span className={style.sendBtn}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-paperPlane"></use>
          </svg>
        </span>
      </div>
      <ul className={style.editArea}>
        <li className={style.optCategery}>
          <span className={style.name}>弹幕字号</span>
          <ul className={style.options}>
            <li className={style.wordOpt}>标准</li>
            <li className={style.wordOpt}>小</li>
          </ul>
        </li>
        <li className={style.optCategery}>
          <span className={style.name}>弹幕位置</span>
          <ul className={style.options}>
            <li className={style.wordOpt}>滚动</li>
            <li className={style.wordOpt}>顶部</li>
            <li className={style.wordOpt}>底部</li>
          </ul>
        </li>
        <li className={style.editColor}>
          <span className={style.colorName}>弹幕颜色</span>
          <ul className={style.colorOpts}>
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#ffffff", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#FE0302", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#FF7204", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#FFAA02", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#FFD302", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#FFFF00", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#A0EE00", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#00CD00", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#019899", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#4266BE", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#89D5FF", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#CC0273", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#222222", borderColor: "#FE0302" }} />
            <li className={style.color + (barrColor === 16777215 ? " " + style.current : "")} style={{ backgroundColor: "#9B9B9B", borderColor: "#FE0302" }} />
          </ul>
        </li>
      </ul>
    </div>
  )
}

export default EditBarr;