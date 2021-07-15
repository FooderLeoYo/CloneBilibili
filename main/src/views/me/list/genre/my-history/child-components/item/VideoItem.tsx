import * as React from "react";
import LazyLoad from "react-lazyload";
import { History } from "history";

import Context from "@context/index";
import { getPicSuffix } from "@customed-methods/image";
import { formatDate } from "@customed-methods/datetime";
import { BatchDelItem } from "@components/header-with-tools/HeaderWithTools"

import style from "./video-item.styl?css-modules";

interface VideoItemProps {
  history: History;
  curFatherInx: number;
  record: {
    author_name: string;
    cover: string;
    history: {
      dt: number;
      oid?: number;
    };
    selected: boolean;
    title: string;
    view_at: number;
    badge?: string;
    duration?: number;
    kid?: number;
    progress?: number;
    tag_name?: string;
  };
  selected?: boolean;
  switchSelected?: Function
  mulDeleting?: boolean;
  selectedStatus?: number;
}

const { useContext, useRef, useEffect } = React;

function VideoItem(props: VideoItemProps) {
  const { record, curFatherInx, selected, switchSelected, mulDeleting } = props;
  const { author_name, cover, history, title, view_at,
    badge, duration, kid, progress, tag_name } = record;
  const { oid, dt } = history;
  const param = oid ? oid : kid;
  const platform = dt === 2 ? "pc" : dt === 4 || dt === 6 ? "pad" : "mobile";
  const curProgress = progress && progress === -1 ? 100 : progress / duration * 100;
  const liveStatus = badge && badge === "未开播" ? "offline" : "live";

  const context = useContext(Context);

  const edittingRef = useRef(mulDeleting);
  useEffect(() => { edittingRef.current = mulDeleting }, [mulDeleting]);

  function handleClick(type: string, param: number) {
    if (edittingRef.current) {
      switchSelected();
    } else {
      if (type === "video") { props.history.push("/video/av" + param); }
      else { props.history.push("/live/" + param); }
    }
  }

  function getPicUrl(url: string, format: string) {
    const { picURL } = context;
    let suffix = ".webp";
    suffix = getPicSuffix();
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  function getTime(timestamp: number) {
    const currentTime = new Date();
    const dateTime = new Date(timestamp * 1000);

    if (currentTime.getFullYear() === dateTime.getFullYear() &&
      currentTime.getMonth() === dateTime.getMonth()) {
      const diffDate = currentTime.getDate() - dateTime.getDate();
      switch (diffDate) {
        case 0:
          return "今天 " + formatDate(dateTime, "hh:mm");
        case 1:
          return "昨天 " + formatDate(dateTime, "hh:mm");
        case 2:
          return "前天 " + formatDate(dateTime, "hh:mm");
        default:
          return formatDate(dateTime, "yyyy-MM-dd hh:mm");
      }
    } else {
      return formatDate(dateTime, "yyyy-MM-dd hh:mm");
    }
  }

  return (
    <div className={style.videoItem}>
      <BatchDelItem clickMethod={() => handleClick(curFatherInx === 0 ? "video" : "live", param)}
        mulDeleting={mulDeleting} selected={selected}
        itemDOM={
          <div className={style.content}>
            <div className={style.imgContainer}>
              <span className={style.placeholder}>
                <svg className="icon" aria-hidden="true">
                  <use href="#icon-placeholder"></use>
                </svg>
              </span>
              <LazyLoad height={"10.575rem"}>
                <img
                  className={style.pic + (curFatherInx === 1 ? " " + style.live : "")}
                  src={getPicUrl(cover, "@320w_200h")}
                />
              </LazyLoad>
              {curFatherInx === 0 && <div className={style.progressWrapper}>
                <div className={style.curProgress} style={{ width: `${curProgress}%` }}></div>
              </div>
              }
            </div>
            <div className={style.info}>
              <p className={style.title} dangerouslySetInnerHTML={{ __html: title }} />
              <div className={style.ownerWrapper}>
                <span className={style.iconUp} >
                  <svg className="icon" aria-hidden="true">
                    <use href="#icon-uper"></use>
                  </svg>
                </span>
                <span className={style.owner}>{author_name}</span>
                {curFatherInx === 1 && <span className={style.tag}>{tag_name}</span>}
                {curFatherInx === 1 && <span className={style[liveStatus]}>{badge}</span>}
              </div>
              <div className={style.time}>
                <span className={style.platform}>
                  <svg className="icon" aria-hidden="true">
                    <use href={`#icon-${platform}`}></use>
                  </svg>
                </span>
                {getTime(view_at)}
              </div>
            </div>
          </div>
        }
      />
    </div>
  )
}

export default VideoItem;
