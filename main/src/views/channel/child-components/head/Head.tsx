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
  isRecAndChildrenGtTwo: boolean,
  lvOnePartition: PartitionType,
  setLvOnePartition: React.Dispatch<React.SetStateAction<PartitionType>>,
  setLvTwoPartition: React.Dispatch<React.SetStateAction<PartitionType>>,
  curLvTwoTabIndex: number,
  setCurLvTwoTabIndex: React.Dispatch<React.SetStateAction<number>>,
  setVideoLatestId: React.Dispatch<React.SetStateAction<number>>
}

const { useEffect, useRef } = React;

function Head(props: HeadProps, ref) {
  const { partitions, match, setIsDataOk, history, setAllData,
    isRecAndChildrenGtTwo, lvOnePartition, setLvOnePartition,
    setLvTwoPartition, curLvTwoTabIndex, setCurLvTwoTabIndex,
    setVideoLatestId } = props;

  const drawerRef: React.RefObject<any> = useRef(null);

  const lvOneDataRef = useRef([]);
  const curOneInxRef = useRef(null);

  const lvTwoDataRef = useRef([]);

  function setOneInxByTwo(id) {
    let tmp = 0;
    curOneInxRef.current = lvOneDataRef.current.findIndex(parittion => {
      tmp = parittion.children.findIndex(child =>
        child.id === parseInt(id, 10)
      );
      return tmp !== -1;
    });
    setLvOnePartition(lvOneDataRef.current[curOneInxRef.current]);

    setCurLvTwoTabIndex(++tmp);
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
        setCurLvTwoTabIndex(0);
        setLvTwoPartition(null);
        // 如果是通过drawer点击的分类，则点击后隐藏drawer
        if (drawerRef.current.pull) { drawerRef.current.hide(); }
      }
    }
  }

  function handleSwitchClick() {
    drawerRef.current.show();
  }

  function handleSecondClick(tab) {
    if (tab.id !== lvTwoDataRef.current[curLvTwoTabIndex].id) {
      setIsDataOk(false);
      history.push({ pathname: "/channel/" + tab.id });
      setOneInxByTwo(tab.id);
      setTimeout(() => { setAllData(); }, 1);
    }
  }

  function setInxAndOnePar() {
    // 一级tab添加“首页”和“直播”
    let tmpData = [{ id: 0, name: "首页", children: [] } as PartitionType].concat(partitions);
    tmpData.push(new PartitionType(-1, "直播"));
    lvOneDataRef.current = tmpData;

    curOneInxRef.current = lvOneDataRef.current.findIndex(parittion =>
      parittion.id === parseInt(match.params.rId, 10)
    );

    if (curOneInxRef.current !== -1) {
      // 当前m.params.rId是一级分类的，即此时的二级分类为“推荐”
      // 设置这种情况下的curLvOneTabIndex、lvOnePartition
      setLvOnePartition(lvOneDataRef.current[curOneInxRef.current]);
    } else {
      // 当前m.params.rId是二级分类的，即此时的二级分类非“推荐”
      // 设置这种情况下的curLvOneTabIndex、lvOnePartition，以及
      // 设置curLvTwoTabIndex
      setOneInxByTwo(match.params.rId);
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
      props.match.params.rId :  // 当前的二级分类为“推荐”，且二级分类有两个或以上
      lvOnePartition.children.length > 1 ? // 如果此时的二级分类非“推荐”
        lvOnePartition.children[curLvTwoTabIndex - 1].id : // 二级分类有两个或以上取当前二级分类
        lvOnePartition.children[0].id; // 只有一个二级分类取第一个

    setVideoLatestId(tmp);
  }

  // useImperativeHandle(ref, () => ({
  //   curLvTwoTabIndex: curTwoInxRef.current,
  // }), [curTwoInxRef.current]);

  useEffect(() => {
    setInxAndOnePar();
    if (curLvTwoTabIndex !== 0) { setLatestId(); } // 非“推荐”时才需要加载最新视频数据
  }, []);

  useEffect(() => {
    setLvTwoTabDataAndPar();
  }, [lvOnePartition]);

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
