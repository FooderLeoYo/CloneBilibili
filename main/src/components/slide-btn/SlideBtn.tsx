import * as React from "react";
import style from "./slide-btn.styl?css-modules";

interface SlideBtnProps {
  model: string;
}

function SlideBtn(props: SlideBtnProps) {
  const { model } = props;

  return (
    <div className={style.slideBtn}>
      <section className={style.modelWrapper + " " + style[model]}>
        <div className={style.checkbox}>
          <input className={style.input} type="checkbox" />
          <label className={style.label}></label>
        </div>
      </section>
    </div>
  )
}

export default SlideBtn;
