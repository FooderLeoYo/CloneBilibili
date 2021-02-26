import * as React from "react";
import { forceCheck } from "react-lazyload";
import { match } from "react-router-dom";
import { Helmet } from "react-helmet";
import { History } from "history";

import myContext from "../../context";
import { setShouldLoad } from "../../redux/action-creators";
import getPartitionList from "../../redux/async-action-creators/channel";
import { getRankingRegion } from "../../api/ranking";
import { getRankingPartitions } from "../../api/partitions";

import { PartitionType, createPartitionTypes, Video, createVideoByRanking } from "../../class-object-creators";
import LoadingCutscene from "../../components/loading-cutscene/LoadingCutscene";
import VideoItem from "../../components/video-item/VideoItem";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";
import Partition from "./child-components/partition/Partition";
import VideoLatest from "./child-components/video-latest/VideoLatest";
import Head from "./child-components/head/Head"

import { getPicSuffix } from "../../customed-methods/image";
import style from "./stylus/channel.styl?css-modules";

interface ChannelProps {
  shouldLoad: boolean,
  partitions: PartitionType[],
  match: match<{ rId }>,
  history: History,
  staticContext?: { picSuffix: string },
  dispatch: (action: any) => Promise<void>,
}

const { useState, useContext, useEffect, useRef } = React;

function Channel(props: ChannelProps) {
  const { history, shouldLoad, dispatch, staticContext, match } = props;
  const context = useContext(myContext);

  // 数据还未加载前，推荐视频VideoItem的默认值
  const initVideos = [];
  for (let i = 0; i < 4; i++) {
    initVideos.push(new Video(0, "加载中...", "", "", 0, 0, 0, 0, 0, ""));
  }

  const [isDataOk, setIsDataOk] = useState(false);
  const [hotVideos, setHotVideos] = useState(initVideos);
  const [lvTwoParHotVideos, setLvTwoParHotVideos] = useState([]);
  const [prevId, setPrevId] = useState(-999);

  const HeadRef: React.RefObject<any> = useRef();
  const HeadDOM = HeadRef.current;
  const curLvTwoTabIndex: number = HeadDOM ? HeadDOM.curLvTwoTabIndex : 0;
  const lvTwoPartition: PartitionType = HeadDOM ? HeadDOM.lvTwoPartition : [];
  const videoLatestId: number = HeadDOM ? HeadDOM.videoLatestId : 0;

  const lvOnePartition: PartitionType = HeadDOM ? HeadDOM.lvOnePartition : [];


  const [isRecAndChildrenGtTwo, setRecGtTwo] = useState(true);
  const rankParRef = useRef(null); // 用于获取点击“排行榜”后，跳转到的url中最后的id

  /* 获取数据相关 */
  function getPicUrl(url, format) {
    const { picURL } = context;
    let suffix: string = ".webp";

    if (process.env.REACT_ENV === "server") { suffix = staticContext.picSuffix; }
    else { suffix = getPicSuffix(); }

    return `${picURL}?pic=${url}${format + suffix}`;
  }

  const rIdRef = useRef(match.params.rId)
  if (rIdRef.current !== match.params.rId) { rIdRef.current = match.params.rId }
  function loadHotVideos() {
    const rId = rIdRef.current;
    getRankingRegion({ rId, day: 7 }).then(result => {
      if (result.code === "1") {
        setHotVideos(
          result.data.splice(0, 4).map(
            data => createVideoByRanking(data)
          )
        );
      }
    });
  }

  function loadAllSecRecVideos() {
    if (Object.keys(lvOnePartition).length !== 0) {
      const lvTwoPartitions: PartitionType[] = lvOnePartition.children;
      const promises = lvTwoPartitions?.map(partition =>
        getRankingRegion({ rId: partition.id, day: 7 })
      );

      Promise.all(promises).then(results => {
        const partitions = [];
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          // result.code是express发送的res中附带的一个自定义属性，规定1表示成功
          if (result.code === "1") {
            const partition = lvTwoPartitions[i];
            partitions.push({
              id: partition.id,
              name: partition.name,
              videos: result.data.splice(0, 4).map(data => createVideoByRanking(data))
            });
          }
        }

        setLvTwoParHotVideos(partitions);
      })
    }
  }

  /* 点击相关 */
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

  /* 设置其他数据相关 */
  function setParOrLatest() {
    if (lvOnePartition && Object.keys(lvOnePartition).length !== 0) {
      setRecGtTwo(curLvTwoTabIndex === 0 && lvOnePartition.children.length > 1);
    }
  }

  // 获取排行榜分类的信息，包含name和id
  function setrankingPartitions() {
    getRankingPartitions().then(result => {
      if (result.code === "1") { rankParRef.current = createPartitionTypes(result.data); }
    });
  }

  function setAllData() {
    loadHotVideos();
    setTimeout(() => { setIsDataOk(true); }, 1);
  }

  function setInitData() {
    setrankingPartitions();
    setAllData();
  }

  useEffect(() => {
    if (shouldLoad) {
      dispatch(getPartitionList()).then(() => { setInitData(); })
    } else {
      setInitData();
      dispatch(setShouldLoad(true));
    }
    // 开发环境中，样式在js加载后动态添加会导致图片被检测到未出现在屏幕上
    // 强制检查懒加载组件是否出现在屏幕上
    setTimeout(() => { forceCheck(); }, 10);
  }, []);

  useEffect(() => {
    setParOrLatest();
  }, [curLvTwoTabIndex, lvOnePartition]);

  useEffect(() => {
    if (curLvTwoTabIndex === 0) { loadAllSecRecVideos(); } // 如果二级tab是“推荐”
  }, [lvOnePartition])

  // 如果不用这个进行清空，在切换时之前的内容会短暂停留
  const rId = parseInt(match.params.rId, 10);
  if (rId !== prevId) {
    // 则清空之前的state数据
    setHotVideos(initVideos);
    setLvTwoParHotVideos([]);
    setPrevId(rId);
  }

  // function getSnapshotBeforeUpdate() {
  //   return document.documentElement.scrollTop || document.body.scrollTop > 0
  // }
  // 若组件更新后窗口发生滚动不处于顶端，则将其调整到最顶端
  // function componentDidUpdate(prevProps, prevState, scroll) {
  //   if (scroll) { window.scrollTo(0, 0); }
  // }

  /* 以下为渲染部分 */
  return (
    <div className="channel">
      <Helmet>
        <title>
          {
            lvOnePartition.name &&
            lvOnePartition.name + (lvTwoPartition ? "-" + lvTwoPartition.name : "")
          }
        </title>
      </Helmet>
      {
        !isDataOk ? <LoadingCutscene /> :
          <>
            {/* 顶部 */}
            <div className={style.topWrapper}>
              <Head
                partitions={props.partitions}
                match={match}
                setIsDataOk={setIsDataOk}
                history={history}
                setAllData={setAllData}
                isRecAndChildrenGtTwo={isRecAndChildrenGtTwo}
                ref={HeadRef}
              />
            </div>
            {/* 是否留出二级tab的位置 */}
            <div className={lvOnePartition?.children?.length > 1 ? style.specialLine1 : style.specialLine2} />
            {/* 主体部分 */}
            <div className={style.partitionWrapper}>
              {/* 热门推荐 */}
              <div className={style.recommend}>
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
              </div>
              { // 分类推荐视频或最新视频
                isRecAndChildrenGtTwo ?
                  // 当前二级分类为“推荐”，则显示分类推荐视频
                  lvTwoParHotVideos.map(partition =>
                    <Partition
                      data={partition}
                      history={history}
                      getPicUrl={(url, format) => getPicUrl(url, format)}
                      key={partition.id}
                    />
                  ) :
                  // 当前二级分类为非“推荐”或一级分类只有一个二级分类，则显示最新视频
                  <VideoLatest
                    id={videoLatestId}
                    getPicUrl={(url, format) => getPicUrl(url, format)}
                  />
              }
            </div>
            <ScrollToTop />
          </>
      }
    </div>
  );
}

export default Channel;
