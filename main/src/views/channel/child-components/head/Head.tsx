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
  setAllData: () => void,
  isRecAndChildrenGtTwo: boolean
}

const { useState, useEffect, useRef, forwardRef, useImperativeHandle } = React;

function Head(props: HeadProps, ref) {
  const { partitions, match, setIsDataOk, history, setAllData, isRecAndChildrenGtTwo } = props;

  const drawerRef: React.RefObject<any> = useRef(null);

  const lvOneDataRef = useRef([]);
  const curOneInxRef = useRef(null);
  const oneParrRef = useRef(null);
  const [oneParFlag, setOneParFlag] = useState(1);

  const lvTwoDataRef = useRef([]);
  const curTwoInxRef = useRef(-99);
  const twoParrRef = useRef(null);

  const latestIdRef = useRef();

  function getLvOneTabData() {
    // 一级tab添加“首页”和“直播”
    let tmpData = [{ id: 0, name: "首页", children: [] } as PartitionType].concat(partitions);
    tmpData.push(new PartitionType(-1, "直播"));
    lvOneDataRef.current = tmpData;
  }

  function setOneInxByTwo(id) {
    curOneInxRef.current = lvOneDataRef.current.findIndex(parittion => {
      curTwoInxRef.current = parittion.children.findIndex(child =>
        child.id === parseInt(id, 10)
      );
      return curTwoInxRef.current !== -1;
    });
    oneParrRef.current = lvOneDataRef.current[curOneInxRef.current];
    curTwoInxRef.current += 1;
  }

  function setTabIndexAndLvOnePar() {
    // 当前m.params.rId是一级分类的，即此时的二级分类为“推荐”
    // 设置这种情况下的curLvOneTabIndex、lvOnePartition
    curOneInxRef.current = lvOneDataRef.current.findIndex(parittion =>
      parittion.id === parseInt(match.params.rId, 10)
    );
    oneParrRef.current = lvOneDataRef.current[curOneInxRef.current];
    setOneParFlag(-oneParFlag);

    // 当前m.params.rId是二级分类的，即此时的二级分类非“推荐”
    // 设置这种情况下的curLvOneTabIndex、lvOnePartition，以及
    // 设置curLvTwoTabIndex
    curTwoInxRef.current = 0;
    if (curOneInxRef.current === -1) { setOneInxByTwo(match.params.rId); } // 根据二级分类查找对应一级分类
  }

  function setLvTwoTabDataAndPar() {
    if (oneParrRef.current) {
      // 设置lvTwoTabData、lvTwoPartition
      let tmpData = [{ id: oneParrRef.current.id, name: "推荐" } as PartitionType]
        .concat(oneParrRef.current.children);
      lvTwoDataRef.current = tmpData;

      // 如果此时的二级分类非“推荐”
      if (curTwoInxRef.current !== 0) {
        twoParrRef.current = lvTwoDataRef.current[curTwoInxRef.current];
      }
    }
  }

  function handleSwitchClick() {
    drawerRef.current.show();
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
        setIsDataOk(false);
        history.push({ pathname: "/channel/" + tab.id });
        // 如果不延时，则调用setAllData时rId还未改变
        setTimeout(() => { setAllData(); }, 1);
        // 如果是通过drawer点击的分类，则点击后隐藏drawer
        if (drawerRef.current.pull) { drawerRef.current.hide(); }
      }
    }
  }

  function setvideoLatestId() {
    const { match: m } = props;
    const oneParr = oneParrRef.current;

    latestIdRef.current = isRecAndChildrenGtTwo ?
      m.params.rId :  // 当前的二级分类为“推荐”，且二级分类有两个或以上
      oneParr.children.length > 1 ? // 如果此时的二级分类非“推荐”
        oneParr.children[curTwoInxRef.current - 1].id : // 二级分类有两个或以上取当前二级分类
        oneParr.children[0].id; // 只有一个二级分类取第一个
  }

  function handleSecondClick(tab) {
    if (tab.id !== lvTwoDataRef.current[curTwoInxRef.current].id) {
      setIsDataOk(false);
      history.push({ pathname: "/channel/" + tab.id });
      setOneInxByTwo(tab.id);
      setTimeout(() => { setAllData(); }, 1);
    }
  }

  useImperativeHandle(ref, () => ({
    curLvTwoTabIndex: curTwoInxRef.current,
    lvOnePartition: oneParrRef.current,
    lvTwoPartition: twoParrRef.current,
    videoLatestId: latestIdRef.current
  }), [oneParrRef.current, curTwoInxRef.current, twoParrRef.current, latestIdRef.current]);

  useEffect(() => {
    getLvOneTabData();
    setTabIndexAndLvOnePar();
    setLvTwoTabDataAndPar();
    if (curTwoInxRef.current !== 0) { setvideoLatestId(); } // 非“推荐”时才需要加载最新视频数据
  }, []);

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
              needForcedUpdate={true}
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
            currentIndex={curTwoInxRef.current}
            clickMethod={handleSecondClick}
            needForcedUpdate={true}
          />
        </div>
      }
    </>
  );
}

export default forwardRef(Head);
