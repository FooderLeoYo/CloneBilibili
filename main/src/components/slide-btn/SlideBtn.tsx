import * as React from "react";
import style from "./slide-btn.styl?css-modules";

interface SlideBtnProps {
  isChecked: boolean;
  model: string;
  setIsChecked: React.Dispatch<React.SetStateAction<boolean>>;
}

function SlideBtn(props: SlideBtnProps) {
  const { isChecked, model, setIsChecked } = props;

  return (
    <div className={style.checkbox + " " + style[model]}>
      <input className={style.input} type="checkbox" defaultChecked={isChecked}
        onClick={e => setIsChecked(e.currentTarget.checked)} />
      <label className={style.label}></label>
    </div>
  )
}

export default SlideBtn;
