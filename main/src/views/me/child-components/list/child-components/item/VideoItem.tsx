import * as React from "react";
import { History } from "history";

import Context from "../../../../../../context";
import { getPicSuffix } from "../../../../../../customed-methods/image";
import { formatDate } from "../../../../../../customed-methods/datetime";

import style from "./video-item.styl?css-modules";

interface VideoItemProps {
  history: History;
  curFatherInx: number;
  record: {
    history: {
      dt: number;
      oid?: number;
    };
    cover: string;
    title: string;
    view_at: number;
    author_mid: number;
    author_name: string;
    progress?: number;
    duration?: number;
    kid?: number;
    badge?: string;
  };
  editting: boolean;
  allSelected: boolean;
}

const { useContext, useState, useRef, useEffect } = React;

function VideoItem(props: VideoItemProps) {
  const { record, curFatherInx, editting, allSelected } = props;
  const { history, cover, title, view_at, author_name,
    progress, duration, kid, badge } = record;
  const { oid, dt } = history;
  const spanParam = oid ? oid : kid;
  const platform = dt === 2 ? "pc" : dt === 4 || dt === 6 ? "pad" : "mobile";
  const edit = editting ? "edit" : "";
  const curProgress = progress && progress === -1 ? 100 : progress / duration * 100;
  const liveStatus = badge && badge === "未开播" ? "offline" : "live";

  const context = useContext(Context);

  const [selected, setSelected] = useState(false);
  const selectedRef = useRef(selected);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const edittingRef = useRef(editting);
  useEffect(() => { edittingRef.current = editting; }, [editting]);

  useEffect(() => { if (allSelected) { setSelected(true) } }, [allSelected]);

  function handleClick(type, param) {
    if (edittingRef.current) {
      setSelected(!selectedRef.current);
    } else {
      if (type === "video") { props.history.push("/video/av" + param); }
      else { props.history.push("/live/" + param); }
    }
  }

  function getPicUrl(url, format) {
    const { picURL } = context;
    let suffix = ".webp";
    suffix = getPicSuffix();
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  function getTime(timestamp) {
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
    <span onClick={() => handleClick("video", spanParam)} >
      {editting && <span className={style.circle}>
        {selected && <svg className="icon" aria-hidden="true">
          <use href="#icon-toast-success"></use>
        </svg>
        }
      </span>
      }
      <div className={style.contentWrapper + " " + style[edit]}>
        <div className={style.imgContainer}>
          <span className={style.placeholder}>
            <svg className="icon" aria-hidden="true">
              <use href="#icon-placeholder"></use>
            </svg>
          </span>
          <img
            className={style.pic + (curFatherInx === 1 ? " " + style.live : "")}
            src={getPicUrl(cover, "@320w_200h")}
          />
          {curFatherInx === 0 && <div className={style.progressWrapper}>
            <div className={style.curProgress} style={{ width: `${curProgress}%` }}></div>
          </div>
          }
        </div>
        <div className={style.info}>
          <div className={style.title}>{title}</div>
          <div className={style.ownerWrapper}>
            <span className={style.iconUp} >
              <svg className="icon" aria-hidden="true">
                <use href="#icon-uper"></use>
              </svg>
            </span>
            <span className={style.owner}>{author_name}</span>
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
    </span>
  )
}

export default VideoItem;
