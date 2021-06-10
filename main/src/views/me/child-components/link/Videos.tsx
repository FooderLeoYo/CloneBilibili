import * as React from "react";
import { Link } from "react-router-dom";

import style from "./style/videos.styl?css-modules";

interface VideosProps {
  uid: number;
}

function Videos(props: VideosProps) {
  const { uid } = props;

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
      <Link className={style.link} to={`me/favorites/${uid}`}>
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
      <Link className={style.link} to="me/like">
        <span className={style.icon}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-like"></use>
          </svg>
        </span>
        <span className={style.word}>我的投币</span>
      </Link>
    </div>
  )
}

export default Videos;