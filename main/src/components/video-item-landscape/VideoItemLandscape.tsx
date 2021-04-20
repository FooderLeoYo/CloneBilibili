import * as React from "react";
import LazyLoad from "react-lazyload";
import { Link } from "react-router-dom";
import { History } from "history";

import myContext from "../../context";
import { getPicSuffix } from "../../customed-methods/image";
import { formatTenThousand, formatDuration } from "../../customed-methods/string";
import { Video } from "../../class-object-creators";

import style from "./video-item-landscape.styl?css-modules";

interface VideoItemLandscapeProps {
  videoData: Video,
  imgParams: {
    imgHeight: string,
    imgSrc: string,
    imgFormat: string,
  },
  picSuffix?: string,
  noOwner?: boolean,
  history?: History,
}

const { useContext, useRef } = React;


function VideoItemLandscape(props: VideoItemLandscapeProps) {
  const context = useContext(myContext);
  const { videoData, imgParams, picSuffix, noOwner, history } = props;
  const { imgHeight, imgSrc, imgFormat } = imgParams;
  const duration = typeof (videoData.duration) === "string" ? videoData.duration :
    formatDuration(videoData.duration, "0#:##:##");

  const ownerRef: React.RefObject<HTMLSpanElement> = useRef(null);

  function getPicUrl(url, format) {
    let suffix = ".webp";

    if (process.env.REACT_ENV === "server") { // 服务端获取图片后缀
      suffix = picSuffix
    } else {
      suffix = getPicSuffix();
    }

    return `${context.picURL}?pic=${url}${format + suffix}`;
  }


  return (
    <>
      {/* 这里的href为相对url，因此不需要写完整的 */}
      <Link to={"/video/av" + videoData.aId}>
        <div className={style.imageContainer}>
          <span className={style.placeholder}>
            <svg className="icon" aria-hidden="true">
              <use href="#icon-placeholder"></use>
            </svg>
          </span>
          <LazyLoad height={imgHeight}>
            <img src={getPicUrl(imgSrc, imgFormat)} />
          </LazyLoad>
          <div className={style.duration}>{duration}</div>
        </div>
        <div className={style.infoWrapper}>
          <p dangerouslySetInnerHTML={{ __html: videoData.title }} />
          {
            !noOwner &&
            <span
              className={style.ownerWrapper}
              onClick={e => {
                e.preventDefault();
                props.history.push({ pathname: "/space/" + videoData.owner.mId });
              }}
            >
              <span className={style.iconUp} >
                <svg className="icon" aria-hidden="true">
                  <use href="#icon-uper"></use>
                </svg>
              </span>
              <span className={style.owner} ref={ownerRef}>
                {videoData.owner.name}
              </span>
            </span>
          }
          <div className={style.countInfo}>
            <span className={style.iconPlay} >
              <svg className="icon" aria-hidden="true">
                <use href="#icon-playCount"></use>
              </svg>
            </span>
            <span className={style.playCount}>
              {formatTenThousand(videoData.playCount)}
            </span>
            <span className={style.iconBarrage} >
              <svg className="icon" aria-hidden="true">
                <use href="#icon-barrageCount"></use>
              </svg>
            </span>
            <span className={style.barrageCount}>
              {formatTenThousand(videoData.barrageCount)}
            </span>
          </div>
        </div>
      </Link>
    </>
  )
}

export default VideoItemLandscape;