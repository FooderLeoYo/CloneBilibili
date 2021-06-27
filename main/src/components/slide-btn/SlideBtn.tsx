import * as React from "react";
import style from "./slide-btn.styl?css-modules";

interface SlideBtnProps {
  checked: boolean;
  model: string;
}

function SlideBtn(props: SlideBtnProps) {
  const { checked, model } = props;

  return (
    <div className={style.checkbox + " " + style[model]}>
      <input className={style.input} type="checkbox" defaultChecked={checked} />
      <label className={style.label}></label>
    </div>
  )
}

export default SlideBtn;
