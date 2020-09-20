import * as React from "react";
import LazyLoad from "react-lazyload";

import { Live } from "../../../class-object-creators";
import { formatTenThousand } from "../../../customed-methods/string";

import style from "./stylus/live-info.styl?css-modules";

interface LiveInfoProps {
  data: Live;
}

function LiveInfo(props: LiveInfoProps) {
  const { data } = props;

  return (
    <div className={style.liveInfo}>
      <div className={style.coverWrapper}>
        <div className={style.cover}>
          {/* offset={100}表示当框进入屏幕100px以后，才加载图片 */}
          <LazyLoad height={"100%"} offset={100}>
            {/* 等图片完全加载后才将opacity由0设为1，以免图片显示不全 */}
            <img src={data.cover} alt={data.title} onLoad={e => {
              (e.currentTarget.parentNode as HTMLImageElement).style.opacity = "1";
            }} />
          </LazyLoad>
        </div>
        <span className={style.name}>{data.upUser.name}</span>
        <span className={style.online}>{formatTenThousand(data.onlineNum)}</span>
      </div>
      <div className={style.title}>{data.title}</div>
    </div>
  );
}

export default LiveInfo;
