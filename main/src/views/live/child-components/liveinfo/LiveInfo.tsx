import * as React from "react";
import LazyLoad from "react-lazyload";

import { Live } from "@class-object-creators/index";
import { formatTenThousand } from "@customed-methods/string";

import style from "./live-info.styl?css-modules";

interface LiveInfoProps {
  data: Live;
}

function LiveInfo(props: LiveInfoProps) {
  const { data } = props;

  return (
    <div className={style.liveInfo}>
      <div className={style.coverWrapper}>
        <div className={style.cover}>
          <span className={style.placeholder}>
            <svg className="icon" aria-hidden="true">
              <use href="#icon-placeholder"></use>
            </svg>
          </span>
          {/* offset={100}表示当框进入屏幕100px以后，才加载图片 */}
          <LazyLoad height={"100%"} offset={100}>
            <img src={data.cover} alt={data.title} />
          </LazyLoad>
        </div>
        <span className={style.name}>{data.upUser.name}</span>
        <span className={style.online}>
          <span className={style.placeholder}>
            <svg className="icon" aria-hidden="true">
              <use href="#icon-liveViewCount"></use>
            </svg>
          </span>
          {formatTenThousand(data.onlineNum)}
        </span>
      </div>
      <div className={style.title}>{data.title}</div>
    </div>
  );
}

export default LiveInfo;
