import * as React from "react";
import { match } from "react-router-dom";
import { History } from "history";

import { PartitionType } from "../../../../class-object-creators";

import Header from "../../../../components/header/Header";
import TabBar from "../../../../components/tab-bar/TabBar";
import Drawer from "../../../../components/drawer/Drawer";

import style from "./head.styl?css-modules";

interface HeadProps {
  partitions: PartitionType[],
  match: match<{ rId }>,
  setIsDataOk: React.Dispatch<React.SetStateAction<boolean>>,
  history: History,
  loadHotVideos: () => void,
  loadAllSecRecVideos: () => void,
  isRecAndChildrenGtTwo: boolean,
  lvOnePartition: PartitionType,
  setLvOnePartition: React.Dispatch<React.SetStateAction<PartitionType>>,
  setLvTwoPartition: React.Dispatch<React.SetStateAction<PartitionType>>,
  curLvTwoTabIndex: number,
  setCurLvTwoTabIndex: React.Dispatch<React.SetStateAction<number>>,
  setVideoLatestId: React.Dispatch<React.SetStateAction<number>>
}

const { useState, useEffect, useRef } = React;

function Head(props: HeadProps) {
  const { partitions, match, history, loadHotVideos, loadAllSecRecVideos,
    isRecAndChildrenGtTwo, lvOnePartition, curLvTwoTabIndex, setLvOnePartition,
    setLvTwoPartition, setCurLvTwoTabIndex, setVideoLatestId } = props;

  const drawerRef: React.RefObject<any> = useRef(null);

  const rIdRef = useRef(match.params.rId);
  useEffect(() => { rIdRef.current = match.params.rId; }, [match.params.rId]);

  const lvOneDataRef = useRef([]);
  const [oneInx, setOneInx] = useState(-9);
  const curOneInxRef = useRef(null);
  useEffect(() => { curOneInxRef.current = oneInx; }, [oneInx]);

  const lvTwoDataRef = useRef([]);
  const twoInxRef = useRef(props.curLvTwoTabIndex);
  useEffect(() => { twoInxRef.current = props.curLvTwoTabIndex; }, [props.curLvTwoTabIndex]);

  function setNotRecStatus(id) {
    let tmpTwoInx = 0;
    const tmpOneInx = lvOneDataRef.current.findIndex(partition => {
      tmpTwoInx = partition.children.findIndex(child =>
        child.id === parseInt(id, 10)
      );
      return tmpTwoInx !== -1;
    });

    setOneInx(tmpOneInx);
    setLvOnePartition(lvOneDataRef.current[tmpOneInx]);
    setLatestId();
    setCurLvTwoTabIndex(tmpTwoInx + 1);
  }

  function setOneTabData() {
    // 一级tab添加“首页”和“直播”
    let tmpData = [{ id: 0, name: "首页", children: [] } as PartitionType].concat(partitions);
    tmpData.push(new PartitionType(-1, "直播"));
    lvOneDataRef.current = tmpData;
  }

  function setOneInxAndPar() {
    const tmpOneInx = lvOneDataRef.current.findIndex(partition =>
      partition.id === parseInt(rIdRef.current, 10)
    );

    if (tmpOneInx !== -1) { // 发生在channle首次加载及点击一级tab后，此时的二级分类为“推荐”
      setOneInx(tmpOneInx);
      setLvOnePartition(lvOneDataRef.current[tmpOneInx]);
    } else {  // 发生在从Video页面返回时，二级分类非“推荐”
      setNotRecStatus(match.params.rId);
    }
  }

  function setLvTwoTabDataAndPar() {
    if (lvOnePartition) {
      // 设置lvTwoTabData、lvTwoPartition
      let tmpData = [{ id: lvOnePartition.id, name: "推荐" } as PartitionType]
        .concat(lvOnePartition.children);
      lvTwoDataRef.current = tmpData;

      // 如果此时的二级分类非“推荐”
      if (curLvTwoTabIndex !== 0) {
        setLvTwoPartition(lvTwoDataRef.current[curLvTwoTabIndex]);
      }
    }
  }

  function setLatestId() {
    const tmp = isRecAndChildrenGtTwo ?
      rIdRef.current :  // 当前的二级分类为“推荐”，且二级分类有两个或以上
      lvOnePartition.children.length > 1 ? // 如果此时的二级分类非“推荐”
        lvOnePartition.children[twoInxRef.current - 1].id : // 二级分类有两个或以上取当前二级分类
        lvOnePartition.children[0].id; // 只有一个二级分类取第一个

    setVideoLatestId(tmp);
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
          setOneInxAndPar();
          loadHotVideos();
          loadAllSecRecVideos();
        });
        if (drawerRef.current.pull) { drawerRef.current.hide(); } // 如果是通过drawer点击的分类，则点击后隐藏drawer
      }
    }
  }

  function handleSwitchClick() {
    drawerRef.current.show();
  }

  function handleSecondClick(tab) {
    if (tab.id !== lvTwoDataRef.current[curLvTwoTabIndex].id) {
      history.push({ pathname: "/channel/" + tab.id });
      rIdRef.current = tab.id;
      scrollTo(0, 0);

      setCurLvTwoTabIndex(lvTwoDataRef.current.findIndex(partition =>
        partition.id === parseInt(tab.id, 10)
      ));
      setTimeout(() => {
        if (twoInxRef.current !== 0) { // 二级tab为非推荐时
          setLatestId();
          setLvTwoPartition(lvTwoDataRef.current[twoInxRef.current]);
        } else { // 二级tab为推荐时
          setLvTwoPartition(null);
          loadAllSecRecVideos();
        }
        loadHotVideos();
      });
    }
  }

  useEffect(() => {
    setOneTabData();
    setOneInxAndPar();
  }, []);

  useEffect(() => {
    setLvTwoTabDataAndPar();
  }, [lvOnePartition]);

  return (
    <>
      <Header />
      <div className={style.partition}>
        {/* 一级分类Tab */}
        <div className={style.tabBar}>
          {
            <TabBar
              data={lvOneDataRef.current}
              type={"indicate"}
              currentIndex={oneInx}
              clickMethod={handleClick}
              needForcedUpdate={true}
            />
          }
        </div>
        {/* 抽屉展开箭头 */}
        <div className={style.switch} onClick={handleSwitchClick}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-arrowDownBig"></use>
          </svg>
        </div>
      </div>
      {/* 抽屉 */}
      <div className={style.drawerPosition}>
        {
          <Drawer
            data={lvOneDataRef.current}
            ref={drawerRef}
            currentIndex={oneInx}
            onClick={handleClick}
          />
        }
      </div>
      {/* 二级分类Tab */}
      {
        lvOnePartition && lvOnePartition.children.length > 1 &&
        <div className={style.secondTabBar}>
          <TabBar
            data={lvTwoDataRef.current}
            type={"hightlight"}
            currentIndex={curLvTwoTabIndex}
            clickMethod={handleSecondClick}
            needForcedUpdate={true}
          />
        </div>
      }
    </>
  );
}

export default Head;
