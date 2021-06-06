import * as React from "react";
import { Link } from "react-router-dom";

import style from "./style/videos.styl?css-modules";

function Videos() {

  return (
    <div className={style.videos}>
      <Link className={style.link} to="/me/history">
        <span className={style.icon}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-history"></use>
          </svg>
        </span>
        <span className={style.word}>历史记录</span>
      </Link>
      <Link className={style.link} to="me/favorites">
        <span className={style.icon}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-favorites"></use>
          </svg>
        </span>
        <span className={style.word}>我的收藏</span>
      </Link>
      <Link className={style.link} to="me/later">
        <span className={style.icon}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-watchLater"></use>
          </svg>
        </span>
        <span className={style.word}>稍后再看</span>
      </Link>
      <Link className={style.link} to="me/bangumi">
        <span className={style.icon}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-bangumiSubscription"></use>
          </svg>
        </span>
        <span className={style.word}>我的追番</span>
      </Link>
    </div>
  )
}

export default Videos;