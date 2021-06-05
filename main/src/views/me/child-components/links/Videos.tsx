import * as React from "react";
import { Link } from "react-router-dom";

import style from "./stylus/videos.styl?css-modules";

function Videos() {

  return (
    <div className={style.Videos}>
      <Link className={style.history} to="/me/list/history">
        <svg className="icon" aria-hidden="true">
          <use href="#icon-history"></use>
        </svg>
      </Link>
      <span className={style.favorites}>
        <svg className="icon" aria-hidden="true">
          <use href="#icon-favorites"></use>
        </svg>
      </span>
      <span className={style.bangumi}>
        <svg className="icon" aria-hidden="true">
          <use href="#icon-bangumiSubscription"></use>
        </svg>
      </span>
      <span className={style.later}>
        <svg className="icon" aria-hidden="true">
          <use href="#icon-watchLater"></use>
        </svg>
      </span>
    </div>
  )
}

export default Videos;