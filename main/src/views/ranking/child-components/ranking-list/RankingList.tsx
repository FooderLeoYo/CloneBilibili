import * as React from "react";
import LazyLoad from "react-lazyload";
import { Link } from "react-router-dom";

import myContext from "../../../../context";
import { formatTenThousand } from "../../../../customed-methods/string";
import { Video } from "../../../../class-object-creators";
import { getPicSuffix } from "../../../../customed-methods/image";

import style from "./ranking-list.styl?css-modules";

interface RankingListProps {
  rankingVideos: Video[],
  picSuffix: string
}

const { useContext } = React;

function RankingList(props: RankingListProps) {
  const { rankingVideos, picSuffix } = props;
  const context = useContext(myContext);

  function getPicUrl(url, format) {
    let suffix = ".webp";
    if (process.env.REACT_ENV === "server") { suffix = picSuffix } // 服务端获取图片后缀
    else { suffix = getPicSuffix(); }

    return `${context.picURL}?pic=${url}${format + suffix}`;
  }

  return (
    <>
      {
        rankingVideos.map((video, i) => (
          <div className={style.videoWrapper} key={i}>
            {/* <a href={"/video/av" + video.aId} > */}
            <Link to={"/video/av" + video.aId}>
              <div className={style.ranking}>
                {/* 排名序号 */}
                {
                  i < 3 ? ( // 排行前3名序号是奖牌
                    <svg className="icon" aria-hidden="true">
                      <use href={`#icon-rank${i + 1}`}></use>
                    </svg>
                  ) : i + 1
                }
              </div>
              <div className={style.info}>
                {/* 视频封面 */}
                <div className={style.imageContainer}>
                  <span className={style.placeholder}>
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-placeholder"></use>
                    </svg>
                  </span>
                  <LazyLoad height={"5.875rem"}>
                    <img src={getPicUrl(video.pic, "@200w_125h")} alt={video.title} />
                  </LazyLoad>
                </div>
                {/* 视频信息 */}
                <div className={style.infoWrapper}>
                  <p>{video.title}</p>
                  <div className={style.ownerWrapper}>
                    <span className={style.iconUp} >
                      <svg className="icon" aria-hidden="true">
                        <use href="#icon-uper"></use>
                      </svg>
                    </span>
                    <span className={style.owner}>{video.owner.name}</span>
                  </div>
                  <div className={style.countInfo}>
                    <span className={style.iconPlay} >
                      <svg className="icon" aria-hidden="true">
                        <use href="#icon-playCount"></use>
                      </svg>
                    </span>
                    <span className={style.playCount}>
                      {formatTenThousand(video.playCount)}
                    </span>
                    <span className={style.iconBarrage} >
                      <svg className="icon" aria-hidden="true">
                        <use href="#icon-barrageCount"></use>
                      </svg>
                    </span>
                    <span className={style.barrageCount}>
                      {formatTenThousand(video.barrageCount)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
            {/* </a> */}
          </div>
        ))
      }
    </>
  )
}

export default RankingList;