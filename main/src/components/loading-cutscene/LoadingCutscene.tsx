import * as React from "react";

import style from "./loading-cutscene.styl?css-modules";
import loadingTV from "../../assets/images/loading.gif";

const LoadingCutscene = () => {
  return (
    <div className={style.loadingWrapper}>
      <div className={style.loadingPic}>
        <img src={loadingTV} alt="(´・ω・｀)正在加载......" />
      </div>
    </div>
  );
}

export default LoadingCutscene;
