import * as React from "react";
import style from "./loading.styl?css-modules";

interface LoadingProps {
  isLive: boolean
}

function Loading(props: LoadingProps) {
  const { isLive } = props;

  return (
    <div className={style.loading}>
      <div className={style.wrapper}>
        <span className={style.animation}>
          {/* <svg className="icon" aria-hidden="true">
                      <use href="#icon-loading"></use>
                    </svg> */}
          <div className={style.loadingIcon}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </span>
        <span className={style.text}>
          {!isLive && "正在缓冲"}
        </span>
      </div>
    </div>
  );
}

export default Loading;