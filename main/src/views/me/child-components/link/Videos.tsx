import * as React from "react";
import { Link } from "react-router-dom";

import style from "./style/videos.styl?css-modules";

function Videos() {

  return (
    <div className={style.Videos}>
      <Link className={style.history} to="/me/history">
        <svg className="icon" aria-hidden="true">
          <use href="#icon-history"></use>
        </svg>
      </Link>
      <Link className={style.favorites} to="me/favorites">
        <svg className="icon" aria-hidden="true">
          <use href="#icon-favorites"></use>
        </svg>
      </Link>
      <Link className={style.later} to="me/later">
        <svg className="icon" aria-hidden="true">
          <use href="#icon-watchLater"></use>
        </svg>
      </Link>
      <Link className={style.bangumi} to="me/bangumi">
        <svg className="icon" aria-hidden="true">
          <use href="#icon-bangumiSubscription"></use>
        </svg>
      </Link>
    </div>
  )
}

export default Videos;