import * as React from "react";
import LazyLoad from "react-lazyload";
import { Link } from "react-router-dom";

import { Video } from "../../class-object-creators";
import { formatTenThousand } from "../../customed-methods/string";

import style from "./video-item.styl?css-modules";

interface VideoItemProps {
  video: Video;
  showStatistics: boolean;
  lazyOffset: number;
}

const VideoItem = (props: VideoItemProps) => {
  const { video, showStatistics, lazyOffset } = props;
  return (
    <div className={style.video}>
      {/* <a className={style.videoLink} href={"/video/av" + video.aId}> */}
      <Link className={style.videoLink} to={"/video/av" + video.aId}>
        <div className={style.imageContainer}>
          <div className={style.imageWrapper}>
            {/* 占位图片 */}
            <span className={style.placeholder}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-placeholder"></use>
              </svg>
            </span>
            {/* 视频封面图片 */}
            {
              video.pic ? (
                // offset设置的是图片在viewport以下(即还未看到该图片)多少px时就加载
                // 可以通过设置offset为负值起到延迟加载的效果
                <LazyLoad height={"100%"} offset={lazyOffset}>
                  <img
                    src={video.pic}
                    className={style.pic}
                    alt={video.title}
                    onLoad={e => {
                      // e是事件参数，通过调用.currentTarget可以拿到触发当前事件的对象
                      (e.currentTarget as HTMLImageElement).style.opacity = "1";
                    }} />
                </LazyLoad>
              ) : null
            }
            {/* 播放数据 */}
            <div className={style.cover} />
            {
              showStatistics ? (
                <div className={style.info}>
                  <span className={style.playIcon} />
                  <svg className="icon" aria-hidden="true">
                    <use href="#icon-playCount"></use>
                  </svg>
                  <span className={style.playCount}>
                    {
                      video.playCount ? formatTenThousand(video.playCount) : "0"
                    }
                  </span>
                  <span className={style.barrageIcon} >
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-barrageCount"></use>
                    </svg>
                  </span>
                  <span className={style.barrageCount}>
                    {
                      video.barrageCount ? formatTenThousand(video.barrageCount) : "0"
                    }
                  </span>
                </div>
              ) : null
            }
          </div>
        </div>
        <div className={style.title}>
          {video.title}
        </div>
      </Link>
      {/* </a> */}
    </div>
  );
}

export default VideoItem;