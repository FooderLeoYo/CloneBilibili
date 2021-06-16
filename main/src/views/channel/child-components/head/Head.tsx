import * as React from "react";
import { match } from "react-router-dom";
import { History } from "history";

import { PartitionType } from "../../../../class-object-creators";

import BigHeader from "../../../../components/big-header/BigHeader";
import TabBar from "../../../../components/tab-bar/TabBar";
import Drawer from "../../../../components/drawer/Drawer";

import style from "./head.styl?css-modules";

interface HeadProps {
  partitions: PartitionType[],
  match: match<{ rId }>,
  history: History,
  loadHotVideos: () => void,
  loadAllSecRecVideos: () => void,
  lvOnePartition: PartitionType,
  setLvOnePartition: React.Dispatch<React.SetStateAction<PartitionType>>,
  setLvTwoPartition: React.Dispatch<React.SetStateAction<PartitionType>>,
  curLvTwoTabIndex: number,
  setCurLvTwoTabIndex: React.Dispatch<React.SetStateAction<number>>,
  setLatestId: Function;
  rIdRef: React.MutableRefObject<any>,
  twoTabData: PartitionType[]
}

const { useState, useEffect, useRef } = React;

function Head(props: HeadProps) {
  const { partitions, match, history, loadHotVideos, loadAllSecRecVideos,
    lvOnePartition, curLvTwoTabIndex, setLvOnePartition, rIdRef, twoTabData,
    setLvTwoPartition, setCurLvTwoTabIndex, setLatestId } = props;

  const lvOneDataRef = useRef([]);
  const [oneInx, setOneInx] = useState(0);
  const curOneInxRef = useRef(null);
  useEffect(() => { curOneInxRef.current = oneInx }, [oneInx]);
  const twoInxRef = useRef(props.curLvTwoTabIndex);
  useEffect(() => { twoInxRef.current = props.curLvTwoTabIndex }, [props.curLvTwoTabIndex]);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true); // 从别的页面初次进入Channel时tabbar不要动画，避免不自然滑动
  const drawerRef: React.RefObject<any> = useRef(null);

  function setOneTabData() {
    // 一级tab添加“首页”和“直播”
    let tmpData = [{ id: 0, name: "首页", children: [] } as PartitionType].concat(partitions);
    tmpData.push(new PartitionType(-1, "直播"));
    lvOneDataRef.current = tmpData;
  }

  function setInxAndPar() {
    let tmpOneInx = lvOneDataRef.current.findIndex(partition =>
      partition.id === parseInt(rIdRef.current, 10)
    );

    if (tmpOneInx === -1) { // 从Video返回Channel且二级分类非“推荐”时
      const { rId } = match.params;
      let tmpTwoInx = 0;
      tmpOneInx = lvOneDataRef.current.findIndex(partition => {
        tmpTwoInx = partition.children.findIndex(child =>
          child.id === parseInt(rId, 10)
        );
        return tmpTwoInx !== -1;
      });

      setCurLvTwoTabIndex(tmpTwoInx + 1);
      setLatestId();
    }
    setOneInx(tmpOneInx);
    setLvOnePartition(lvOneDataRef.current[tmpOneInx]);
  }

  function handleClick(tab) {
    if (tab.id !== lvOneDataRef.current[curOneInxRef.current].id) {
      if (tab.id === -1) {
        // window.location.href = "/live";
        history.push({ pathname: "/live" });
      } else if (tab.id === 0) {
        // window.location.href = "/index";
        history.push({ pathname: "/index" });
      } else {
        history.push({ pathname: "/channel/" + tab.id });
        scrollTo(0, 0);

        setCurLvTwoTabIndex(0);
        setLvTwoPartition(null);
        setTimeout(() => { // 如果不延时，则调用下列方法时rId还未改变
          setInxAndPar();
          loadHotVideos();
        }, 100); // 这里给了100ms是因为safari上rIdRef改变的特别慢
        drawerRef.current.pull && drawerRef.current.hide()  // 如果是通过drawer点击的分类，则点击后隐藏drawer
        firstTimeLoad && setFirstTimeLoad(false)
      }
    }
  }

  function handleSecondClick(tab) {
    if (tab.id !== twoTabData[curLvTwoTabIndex].id) {
      history.push({ pathname: "/channel/" + tab.id });
      rIdRef.current = tab.id;
      firstTimeLoad && setFirstTimeLoad(false)

      setCurLvTwoTabIndex(twoTabData.findIndex(partition =>
        partition.id === parseInt(tab.id, 10)
      ));
      setTimeout(() => {
        if (twoInxRef.current !== 0) { // 二级tab为非推荐时
          setLvTwoPartition(twoTabData[twoInxRef.current]);
          setLatestId();
        } else { // 二级tab为推荐时
          setLvTwoPartition(null);
          loadAllSecRecVideos();
        }
      });
    }
  }

  // 从别的页面跳转到Channel时，设置tabBar
  useEffect(() => {
    if (partitions.length > 0) {
      setOneTabData();
      setInxAndPar();
    }
  }, [partitions.length]);

  return (
    <>
      <BigHeader />
      <div className={style.partition}>
        {/* 一级分类Tab */}
        <div className={style.oneTabBar}>
          <TabBar data={lvOneDataRef.current} needUnderline={true} currentIndex={oneInx}
            clickMethod={handleClick} noSlideAni={firstTimeLoad} needForcedUpdate={true}
          />
        </div>
        {/* 抽屉展开箭头 */}
        <div className={style.switch} onClick={() => drawerRef.current.show()}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-arrowDownBig"></use>
          </svg>
        </div>
      </div>
      {/* 抽屉 */}
      <div className={style.drawerPosition}>
        <Drawer data={lvOneDataRef.current} ref={drawerRef} currentIndex={oneInx} onClick={handleClick} />
      </div>
      {/* 二级分类Tab */}
      {lvOnePartition && lvOnePartition.children.length > 1 &&
        <div className={style.twoTabBar}>
          <TabBar oneInx={oneInx} clickMethod={handleSecondClick} noSlideAni={firstTimeLoad}
            needForcedUpdate={true} currentIndex={curLvTwoTabIndex} data={twoTabData}
          />
        </div>
      }
    </>
  );
}

export default Head;
