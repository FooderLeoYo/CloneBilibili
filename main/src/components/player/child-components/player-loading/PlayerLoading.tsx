import * as React from "react";

import style from "./player-loading.styl?css-modules";

function PlayerLoading() {
  return (
    <div className={style.loadingWrapper}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

export default PlayerLoading;