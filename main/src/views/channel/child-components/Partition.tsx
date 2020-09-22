import * as React from "react";

import VideoItem from "../../../components/video-item/VideoItem";

import style from "../stylus/partition.styl?css-modules";

const Partition = props => {
  const { data, history, getPicUrl } = props;

  return (
    <div className={style.partition}>
      <div className={style.title}>{data.name}</div>
      <div className={style.ranking}>
        <span
          className={style.more}
          onClick={() => { history.push({ pathname: "/channel/" + data.id }) }}
        >
          查看更多
        </span>
        <i className={`${style.iconRight} icon-arrow-right`} />
      </div>
      <div className={style.partitionContent + " clear"}>
        {
          data.videos.map((item, i) => {
            if (item.pic && item.pic.indexOf("@320w_200h") === -1) {
              item.pic = getPicUrl(item.pic, "@320w_200h");
            }
            return <VideoItem
              video={item} key={i} showStatistics={true} lazyOffset={100}
            />
          })
        }
      </div>
    </div>
  );
}

// withRouter：在不是通过路由切换过来的组件中，将react-router 的 history、location、match 三个对象传入props对象上
export default Partition;
