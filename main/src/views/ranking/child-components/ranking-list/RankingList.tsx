import * as React from "react";
import { Link } from "react-router-dom";

import myContext from "../../../../context";
import { Video } from "../../../../class-object-creators";

import VideoItemLandscape from "../../../../components/video-item-landscape/VideoItemLandscape";
import style from "./ranking-list.styl?css-modules";

interface RankingListProps {
  rankingVideos: Video[],
  picSuffix: string
}

const { useContext } = React;

function RankingList(props: RankingListProps) {
  const { rankingVideos, picSuffix } = props;
  const context = useContext(myContext);

  return (
    <>
      {
        rankingVideos.map((video, i) => (
          <div className={style.videoWrapper} key={i}>
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
                <VideoItemLandscape
                  videoData={video}
                  imgParams={{
                    imgHeight: "5.875rem",
                    imgSrc: video.pic,
                    imgFormat: "@200w_125h"
                  }}
                  picSuffix={picSuffix}
                />
              </div>
            </Link>
          </div>
        ))
      }
    </>
  )
}

export default RankingList;