import * as React from "react";
import { Video } from "../../../../class-object-creators";
import { Link } from "react-router-dom";

import VideoItem from "../../../../components/video-item-portrait/VideoItemPortrait";
import style from "./partition.styl?css-modules";

interface PartitionProps {
  data: {
    id: number,
    name: string,
    videos: Video[]
  },
  getPicUrl: Function,
}


function Partition(props: PartitionProps) {
  const { data, getPicUrl } = props;

  return (
    <div className={style.partition}>
      <div className={style.title}>{data.name}</div>
      <div className={style.ranking}>
        <Link className={style.more} to={"/channel/" + data.id}>查看更多</Link>
        <svg className="icon" aria-hidden="true">
          <use href="#icon-moreNoFill"></use>
        </svg>
      </div>
      <div className={style.partitionContent + " clear"}>
        {
          data.videos.map((item, i) => {
            if (item.pic && item.pic.indexOf("@320w_200h") === -1) {
              item.pic = getPicUrl(item.pic, "@320w_200h");
            }
            return <VideoItem video={item} key={i} showStatistics={true} lazyOffset={100} />
          })
        }
      </div>
    </div>
  );
}

export default Partition;
