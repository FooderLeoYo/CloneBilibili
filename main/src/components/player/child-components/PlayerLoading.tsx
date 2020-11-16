import * as React from "react";

import style from "./stylus/player-loading.styl?css-modules";

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