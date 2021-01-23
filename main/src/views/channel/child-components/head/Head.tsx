import * as React from "react";
import { match } from "react-router-dom";

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

}

const { useRef, useEffect } = React;

function Head(props: HeadProps) {
  const { partitions, match, setIsDataOk, history } = props;

  let prevLvTwoTabIndex: number = 0;
  let curLvOneTabIndex: number;
  let lvTwoTabData: PartitionType[];
  let lvOneTabData: PartitionType[];

  function getLvOneTabData() {
    // 一级tab添加“首页”和“直播”
    lvOneTabData = [{ id: 0, name: "首页", children: [] } as PartitionType].concat(partitions);
    lvOneTabData.push(new PartitionType(-1, "直播"));
  }

  function setTabIndex(id) {
    curLvOneTabIndex = lvOneTabData.findIndex(parittion => {
      curLvTwoTabIndex = parittion.children.findIndex(child =>
        child.id === parseInt(id, 10)
      );
      return curLvTwoTabIndex !== -1;
    });
    lvOnePartition = lvOneTabData[curLvOneTabIndex];
    curLvTwoTabIndex += 1;
  }

  function setTabIndexAndLvOnePar() {
    const { match: m } = props;

    // 当前m.params.rId是一级分类的，即此时的二级分类为“推荐”
    // 设置这种情况下的curLvOneTabIndex、lvOnePartition
    curLvOneTabIndex = lvOneTabData.findIndex(parittion =>
      parittion.id === parseInt(m.params.rId, 10)
    );
    lvOnePartition = lvOneTabData[curLvOneTabIndex];

    // 当前m.params.rId是二级分类的，即此时的二级分类非“推荐”
    // 设置这种情况下的curLvOneTabIndex、lvOnePartition，以及
    // 设置curLvTwoTabIndex
    curLvTwoTabIndex = 0;
    if (!lvOnePartition) { setTabIndex(m.params.rId); } // 根据二级分类查找对应一级分类
  }

  function setLvTwoTabDataAndPar() {
    // 设置lvTwoTabData、lvTwoPartition
    lvTwoTabData = [{ id: lvOnePartition.id, name: "推荐" } as PartitionType]
      .concat(lvOnePartition.children);

    // 如果此时的二级分类非“推荐”
    if (curLvTwoTabIndex !== 0) {
      lvTwoPartition = lvTwoTabData[curLvTwoTabIndex];
    }
  }

  function handleSwitchClick() {
    drawerRef.current.show();
  }

  function handleClick(tab) {
    if (tab.id !== curLvOneTabIndex) {
      // 当前分类为直播
      if (tab.id === -1) {
        // window.location.href = "/live";
        history.push({ pathname: "/live" });
        return;
      }
      if (tab.id === 0) {
        // window.location.href = "/index";
        history.push({ pathname: "/index" });
      } else {
        setState({ isDataOk: false });
        history.push({ pathname: "/channel/" + tab.id });
        // 这里如果不放到延时里，setAllData里的方法调用时，tab.id还没来得及变
        setTimeout(() => { setAllData(); }, 1);
        // 如果是通过drawer点击的分类，则点击后隐藏drawer
        if (drawerRef.current.pull) { drawerRef.current.hide(); }
      }
    }
  }

  function handleSecondClick(tab) {
    setTabIndex(tab.id);
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

    videoLatestId = isRecAndChildrenGtTwo ?
      m.params.rId :  // 当前的二级分类为“推荐”，且二级分类有两个或以上
      lvOnePartition.children.length > 1 ? // 如果此时的二级分类非“推荐”
        lvOnePartition.children[curLvTwoTabIndex - 1].id : // 二级分类有两个或以上取当前二级分类
        lvOnePartition.children[0].id; // 只有一个二级分类取第一个
  }

  useEffect(() => {
    getLvOneTabData();
    setTabIndexAndLvOnePar();
    setLvTwoTabDataAndPar();
  }, []);

  return (
    <>
      <Header />
      {/* 一级分类Tab */}
      <div className={style.partition}>
        <div className={style.tabBar}>
          <TabBar
            data={lvOneTabData}
            type={"indicate"}
            currentIndex={curLvOneTabIndex}
            clickMethod={handleClick}
          />
        </div>
        <div className={style.switch} onClick={handleSwitchClick}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-arrowDownBig"></use>
          </svg>
        </div>
      </div>
      {/* 抽屉 */}
      <div className={style.drawerPosition}>
        <Drawer
          data={lvOneTabData}
          ref={drawerRef}
          currentIndex={curLvOneTabIndex}
          onClick={handleClick}
        />
      </div>
      {/* 二级分类Tab */}
      {
        lvOnePartition.children.length > 1 &&
        <div className={style.secondTabBar}>
          <TabBar
            data={lvTwoTabData}
            type={"hightlight"}
            currentIndex={curLvTwoTabIndex}
            clickMethod={handleSecondClick}
          />
        </div>
      }
    </>
  );
}

export default Head;
