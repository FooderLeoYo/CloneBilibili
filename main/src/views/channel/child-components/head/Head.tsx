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
  setAllData: () => Promise<void>,
  isRecAndChildrenGtTwo: boolean
}

const { useState, useEffect, useRef, forwardRef, useImperativeHandle } = React;

function Head(props: HeadProps, ref) {
  const { partitions, match, setIsDataOk, history, setAllData, isRecAndChildrenGtTwo } = props;

  const drawerRef: React.RefObject<any> = useRef(null);

  // const [lvOneTabData, setLvOneTabData] = useState([]);
  const lvOneDataRef = useRef([]);
  // if (lvOneDataRef.current !== lvOneTabData) { lvOneDataRef.current = lvOneTabData; }

  // let curLvOneTabIndex: number;
  const curOneInxRef = useRef(null);

  // const [lvOnePartition, setLvOnePartition] = useState(null);
  const oneParrRef = useRef(null);
  // if (oneParrRef.current !== lvOnePartition) { oneParrRef.current = lvOnePartition }

  // const [lvTwoTabData, setLvTwoTabData] = useState([]);
  const lvTwoDataRef = useRef([]);
  // if (lvTwoDataRef.current !== lvTwoTabData) { lvTwoDataRef.current = lvTwoTabData; }

  let curLvTwoTabIndex: number;
  let prevLvTwoTabIndex: number = 0;
  let lvTwoPartition: PartitionType;
  let videoLatestId: number;

  function getLvOneTabData() {
    // 一级tab添加“首页”和“直播”
    let tmpData = [{ id: 0, name: "首页", children: [] } as PartitionType].concat(partitions);
    tmpData.push(new PartitionType(-1, "直播"));
    // setLvOneTabData(tmpData);
    lvOneDataRef.current = tmpData;
  }

  function setOneInxByTwo(id) {
    curOneInxRef.current = lvOneDataRef.current.findIndex(parittion => {
      curLvTwoTabIndex = parittion.children.findIndex(child =>
        child.id === parseInt(id, 10)
      );
      return curLvTwoTabIndex !== -1;
    });
    // setLvOnePartition(lvOneDataRef.current[curLvOneTabIndex]);
    oneParrRef.current = lvOneDataRef.current[curOneInxRef.current];
    curLvTwoTabIndex += 1;
  }

  function setTabIndexAndLvOnePar() {
    // 当前m.params.rId是一级分类的，即此时的二级分类为“推荐”
    // 设置这种情况下的curLvOneTabIndex、lvOnePartition
    curOneInxRef.current = lvOneDataRef.current.findIndex(parittion =>
      parittion.id === parseInt(match.params.rId, 10)
    );
    // setLvOnePartition(lvOneDataRef.current[curLvOneTabIndex]);
    oneParrRef.current = lvOneDataRef.current[curOneInxRef.current];

    // 当前m.params.rId是二级分类的，即此时的二级分类非“推荐”
    // 设置这种情况下的curLvOneTabIndex、lvOnePartition，以及
    // 设置curLvTwoTabIndex
    curLvTwoTabIndex = 0;
    // if (!oneParrRef.current) {
    if (curOneInxRef.current === -1) { setOneInxByTwo(match.params.rId); } // 根据二级分类查找对应一级分类
  }

  function setLvTwoTabDataAndPar() {
    if (oneParrRef.current) {
      // 设置lvTwoTabData、lvTwoPartition
      let tmpData = [{ id: oneParrRef.current.id, name: "推荐" } as PartitionType]
        .concat(oneParrRef.current.children);
      // setLvTwoTabData(tmpData);
      lvTwoDataRef.current = tmpData;

      // 如果此时的二级分类非“推荐”
      if (curLvTwoTabIndex !== 0) {
        lvTwoPartition = lvTwoDataRef.current[curLvTwoTabIndex];
      }
    }
  }

  function handleSwitchClick() {
    drawerRef.current.show();
  }

  function handleClick(tab) {
    // console.log("tab.id: " + tab.id)
    // console.log("curOneInxRef: " + curOneInxRef.current)
    if (lvOneDataRef.current[curOneInxRef.current].id !== tab.id) {
      if (tab.id === -1) {
        // window.location.href = "/live";
        history.push({ pathname: "/live" });
      } else if (tab.id === 0) {
        // window.location.href = "/index";
        history.push({ pathname: "/index" });
      } else {
        setIsDataOk(false);
        history.push({ pathname: "/channel/" + tab.id });
        // 这里如果不放到延时里，setAllData里的方法调用时，tab.id还没来得及变
        setTimeout(() => { setAllData(); }, 1);
        // 如果是通过drawer点击的分类，则点击后隐藏drawer
        if (drawerRef.current.pull) { drawerRef.current.hide(); }
      }
    }
  }

  function handleSecondClick(tab) {
    setOneInxByTwo(tab.id);
    if (prevLvTwoTabIndex !== curLvTwoTabIndex) {
      setIsDataOk(false);
      history.push({ pathname: "/channel/" + tab.id });
      setTimeout(() => {
        setAllData();
        // 非“推荐”时才需要加载最新视频数据
        if (curLvTwoTabIndex !== 0) { setvideoLatestId(); }
        prevLvTwoTabIndex = curLvTwoTabIndex;
      }, 1);
    }
  }

  function setvideoLatestId() {
    const { match: m } = props;
    const oneParr = oneParrRef.current;

    videoLatestId = isRecAndChildrenGtTwo ?
      m.params.rId :  // 当前的二级分类为“推荐”，且二级分类有两个或以上
      oneParr.children.length > 1 ? // 如果此时的二级分类非“推荐”
        oneParr.children[curLvTwoTabIndex - 1].id : // 二级分类有两个或以上取当前二级分类
        oneParr.children[0].id; // 只有一个二级分类取第一个
  }

  useImperativeHandle(ref, () => ({
    curLvTwoTabIndex: curLvTwoTabIndex,
    lvOnePartition: oneParrRef.current,
    lvTwoPartition: lvTwoPartition,
    videoLatestId: videoLatestId
  }), [oneParrRef.current, curLvTwoTabIndex, lvTwoPartition, videoLatestId]);

  useEffect(() => {
    getLvOneTabData();
    setTabIndexAndLvOnePar();
  }, []);

  useEffect(() => {
    setLvTwoTabDataAndPar();

  }, [oneParrRef.current]);

  return (
    <>
      <Header />
      {/* 一级分类Tab */}
      <div className={style.partition}>
        <div className={style.tabBar}>
          {
            <TabBar
              data={lvOneDataRef.current}
              type={"indicate"}
              currentIndex={curOneInxRef.current}
              clickMethod={handleClick}
            />
          }
        </div>
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
            currentIndex={curOneInxRef.current}
            onClick={handleClick}
          />
        }
      </div>
      {/* 二级分类Tab */}
      {
        oneParrRef.current?.children.length > 1 &&
        <div className={style.secondTabBar}>
          <TabBar
            data={lvTwoDataRef.current}
            type={"hightlight"}
            currentIndex={curLvTwoTabIndex}
            clickMethod={handleSecondClick}
          />
        </div>
      }
    </>
  );
}

export default forwardRef(Head);
