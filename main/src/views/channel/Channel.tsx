import * as React from "react";
import { forceCheck } from "react-lazyload";
import { match } from "react-router-dom";
import { Helmet } from "react-helmet";
import { History } from "history";

import myContext from "@context/index";
import { setShouldLoad } from "@redux/action-creators";
import getPartitionList from "@redux/async-action-creators/channel";
import { getRankingRegion } from "@api/ranking";
import { getRankingPartitions } from "@api/partitions";

import Head from "./child-components/head/Head"
import Hot from "./child-components/hot/Hot"
import Partition from "./child-components/partition/Partition";
import VideoLatest from "./child-components/video-latest/VideoLatest";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";

import { PartitionType, createPartitionTypes, createVideoByRanking } from "@class-object-creators/index";
import { getPicSuffix } from "@customed-methods/image";
import style from "./channel.styl?css-modules";

interface ChannelProps {
  shouldLoad: boolean,
  lvOneTabs: PartitionType[],
  match: match<{ rId }>,
  history: History,
  staticContext?: { picSuffix: string },
  dispatch: (action: any) => Promise<void>,
}

const { useState, useContext, useEffect, useRef } = React;

function Channel(props: ChannelProps) {
  const { history, shouldLoad, dispatch, staticContext, match, lvOneTabs } = props;
  const context = useContext(myContext);

  const [hotVideos, setHotVideos] = useState([]);
  const [videoLatestId, setVideoLatestId] = useState(0);
  const [isRecAndChildrenGtTwo, setIsRecAndChildrenGtTwo] = useState(true);
  const rankParRef = useRef(null); // 用于获取点击“排行榜”后，跳转到的url中最后的id

  const [lvOnePartition, setLvOnePartition] = useState<PartitionType>(null);
  const oneParRef = useRef(lvOnePartition);
  useEffect(() => { oneParRef.current = lvOnePartition; }, [lvOnePartition]);
  const [lvTwoPartition, setLvTwoPartition] = useState<PartitionType>(null);
  const [curLvTwoTabIndex, setCurLvTwoTabIndex] = useState(0);
  const twoInxRef = useRef(curLvTwoTabIndex);
  useEffect(() => { twoInxRef.current = curLvTwoTabIndex; }, [curLvTwoTabIndex]);
  const [twoTabData, setTwoTabData] = useState([]);
  const [lvTwoParHotVideos, setLvTwoParHotVideos] = useState([]);

  const rIdRef = useRef(match.params.rId)
  useEffect(() => { rIdRef.current = match.params.rId; }, [match.params.rId]);

  function getPicUrl(url, format) {
    const { picURL } = context;
    let suffix: string = ".webp";

    if (process.env.REACT_ENV === "server") { suffix = staticContext.picSuffix; }
    else { suffix = getPicSuffix(); }

    return `${picURL}?pic=${url}${format + suffix}`;
  }

  function setLvTwoTabData() {
    const lvOneChildren = lvOnePartition?.children;
    lvOneChildren?.length > 0 && setTwoTabData([{ id: lvOnePartition.id, name: "推荐" } as PartitionType]
      .concat(lvOneChildren));
  }

  function loadHotVideos() {
    const rId = rIdRef.current;
    getRankingRegion({ rId, day: 7 }).then(result => {
      if (result.code === "1") {
        setHotVideos(result.data.splice(0, 4).map(data => createVideoByRanking(data)));
      }
    });
  }

  function loadAllSecRecVideos() {
    if (lvOnePartition) {
      const lvTwoPartitions: PartitionType[] = lvOnePartition.children;
      const promises = lvTwoPartitions?.map(partition =>
        getRankingRegion({ rId: partition.id, day: 7 })
      );

      Promise.all(promises).then(results => {
        const partitions = [];
        for (let i = 0; i < results.length; i++) {
          const result = results[i];
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

  // 获取排行榜分类的信息，包含name和id
  function setRankingPartitions() {
    getRankingPartitions().then(result => {
      if (result.code === "1") { rankParRef.current = createPartitionTypes(result.data) }
    });
  }

  function setLatestId() {
    const onePar = oneParRef.current;
    const tmp = isRecAndChildrenGtTwo ?
      rIdRef.current :  // 当前的二级分类为“推荐”，且二级分类有两个或以上
      onePar.children.length > 1 ? // 如果此时的二级分类非“推荐”
        onePar.children[twoInxRef.current - 1].id : // 二级分类有两个或以上取当前二级分类
        onePar.children[0].id; // 只有一个二级分类取第一个

    setVideoLatestId(tmp);
  }

  useEffect(() => {
    if (shouldLoad) { dispatch(getPartitionList()) }
    else { dispatch(setShouldLoad(true)) }
    // 开发环境中，样式在js加载后动态添加会导致图片被检测到未出现在屏幕上
    // 强制检查懒加载组件是否出现在屏幕上
    setTimeout(() => { forceCheck(); }, 10);
  }, []);

  useEffect(() => {
    if (lvOneTabs.length > 0) {
      setRankingPartitions();
      loadHotVideos();
    }
  }, [lvOneTabs]);

  // 切换一级tab后重新设置二级tab及加载所有二级推荐视频
  useEffect(() => {
    setLvTwoTabData();
    loadAllSecRecVideos();
  }, [lvOnePartition?.id]);

  // 点击二级tab或“查看更多”后加载对应热门视频；检查当前二级tab是否为“推荐”
  useEffect(() => {
    if (lvOnePartition) { // 跳过curLvTwoTabIndex初始化时触发的那次useEffect
      loadHotVideos();
      curLvTwoTabIndex > 0 && scrollTo(0, 0);
    }
    lvOnePartition && setIsRecAndChildrenGtTwo(curLvTwoTabIndex === 0 && lvOnePartition.children.length > 1);
  }, [curLvTwoTabIndex]);

  // 数据加载过程中，视频封面的placeholder
  // const initVideos = [];
  // for (let i = 0; i < 4; i++) {
  //   initVideos.push(new Video(0, "加载中...", "", "", 0, 0, 0, 0, 0, ""));
  // }

  // 切换tab后，加载过程中显示placeholder图片
  // useEffect(() => {
  //   setHotVideos(initVideos);
  //   setLvTwoParHotVideos([]);
  // }, [match.params.rId]);

  return (
    <div className="channel">
      <Helmet><title>{lvOnePartition && lvOnePartition.name + (lvTwoPartition ? "-" + lvTwoPartition.name : "")}</title></Helmet>
      {<>
        {/* 顶部 */}
        <div className={style.topWrapper}>
          <Head match={match} history={history} twoTabData={twoTabData}
            lvOneTabs={lvOneTabs} lvOnePartition={lvOnePartition}
            setLvOnePartition={setLvOnePartition} setLvTwoPartition={setLvTwoPartition}
            curLvTwoTabIndex={curLvTwoTabIndex} setCurLvTwoTabIndex={setCurLvTwoTabIndex}
            loadHotVideos={loadHotVideos} loadAllSecRecVideos={loadAllSecRecVideos}
            setLatestId={setLatestId} rIdRef={rIdRef}
          />
        </div>
        {/* 是否留出二级tab的位置 */}
        <div className={lvOnePartition?.children?.length > 1 ? style.specialLine1 : style.specialLine2} />
        {/* 主体部分 */}
        <div className={style.partitionWrapper}>
          {/* 热门推荐 */}
          <div className={style.recommend}>
            <Hot rankParRef={rankParRef} isRecAndChildrenGtTwo={isRecAndChildrenGtTwo}
              lvOnePartition={lvOnePartition} hotVideos={hotVideos}
              getPicUrl={getPicUrl} history={history}
            />
          </div>
          {/* 分类推荐视频或最新视频 */}
          {isRecAndChildrenGtTwo ? // 当前二级分类为“推荐”，则显示分类推荐视频
            lvTwoParHotVideos.map((partition, index) =>
              <Partition data={partition} key={partition.id} index={index}
                getPicUrl={(url, format) => getPicUrl(url, format)}
                setCurLvTwoTabIndex={setCurLvTwoTabIndex} setLatestId={setLatestId}
              />
            ) : // 当前二级分类为非“推荐”或一级分类只有一个二级分类，则显示最新视频
            <VideoLatest match={match} getPicUrl={(url, format) => getPicUrl(url, format)} />
          }
        </div>
        <ScrollToTop />
      </>
      }
    </div>
  );
}

export default Channel;
