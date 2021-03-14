import * as React from "react";
import { withRouter } from "react-router-dom";
import { History } from "history";
import { Video } from "../../../../class-object-creators";

import VideoItem from "../../../../components/video-item/VideoItem";
import style from "./partition.styl?css-modules";

interface PartitionProps {
  data: {
    id: number,
    name: string,
    videos: Video[]
  },
  history: History,
  getPicUrl: Function,
}

const { useRef, useEffect } = React;

function Partition(props: PartitionProps) {
  const { data, getPicUrl, history } = props;

  const moreRef: React.RefObject<HTMLSpanElement> = useRef(null);
  useEffect(() => {
    moreRef.current.addEventListener("click", () => {
      history.push({ pathname: "/channel/" + data.id })
    })
  }, []);

  return (
    <div className={style.partition}>
      <div className={style.title}>{data.name}</div>
      <div className={style.ranking}>
        <span className={style.more} ref={moreRef}>查看更多</span>
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
// export default withRouter(Partition);
