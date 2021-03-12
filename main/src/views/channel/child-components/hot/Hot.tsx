import * as React from "react";
import { History } from "history";

import { PartitionType } from "../../../../class-object-creators";
import VideoItem from "../../../../components/video-item/VideoItem";

import style from "./hot.styl?css-modules";

interface HotProps {
  rankParRef: React.MutableRefObject<any>,
  isRecAndChildrenGtTwo: boolean,
  lvOnePartition: PartitionType,
  hotVideos: any[],
  getPicUrl: Function,
  history: History,
}

function Hot(props: HotProps) {
  const { rankParRef, isRecAndChildrenGtTwo, lvOnePartition, hotVideos,
    getPicUrl, history } = props;

  function handleRankingClick(lvOnePartition) {
    if (rankParRef.current.length > 0) {
      // 从一级分类中查找与当前ranking分类相同的ranking分类
      if (rankParRef.current.findIndex(partition =>
        partition.id === lvOnePartition.id) !== -1) {
        // window.location.href = "/ranking/" + lvOnePartition.id
        history.push({ pathname: "/ranking/" + lvOnePartition.id });
      } else {
        // 如果一级分类中没有，则从二级分类中查找
        const partitionType = rankParRef.current.find(partition =>
          lvOnePartition.children.findIndex(p =>
            p.id === partition.id) !== -1
        );
        // window.location.href = "/ranking/" + partitionType.id
        history.push({ pathname: "/ranking/" + partitionType.id });
      }
    }
  }
  return (
    <>
      <div className={style.title}>热门推荐</div>
      { // 排行榜
        isRecAndChildrenGtTwo &&
        <div
          className={style.ranking}
          onClick={() => { handleRankingClick(lvOnePartition) }}
        >
          <svg className="icon" aria-hidden="true">
            <use href="#icon-ranking"></use>
          </svg>
          <span className={style.text}>排行榜</span>
          <span className={style.more}>
            <svg className="icon" aria-hidden="true">
              <use href="#icon-back"></use>
            </svg>
          </span>
        </div>
      }
      {/* 4个热门推荐视频 */}
      <div className={style.recommendContent + " clear"}>
        {
          hotVideos.map((video, i) => {
            if (video.pic && video.pic.indexOf("@320w_200h") === -1) {
              video.pic = getPicUrl(video.pic, "@320w_200h");
            }
            return <VideoItem video={video} key={i} showStatistics={true} lazyOffset={100} />
          })
        }
      </div>
    </>
  );
}

export default Hot;
