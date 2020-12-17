import * as React from "react";
import { History } from "history";

import { PartitionType, LiveSecQueryParType } from "../../../class-object-creators";

import Header from "../../../components/header/Header";
import TabBar from "../../../components/tab-bar/TabBar";
import Drawer from "../../../components/drawer/Drawer";

import style from "./stylus/nav.styl?css-modules";

interface NavProps {
  history: History,
  firstTabBarData: PartitionType[],
  secondTabBarData: PartitionType[],
  lvTwoInx: number,
  secondQueryPar: LiveSecQueryParType[],
  sendLvTowInx?: any,
}

const { useState, useRef } = React;

function Nav(props: NavProps) {
  const { firstTabBarData, secondTabBarData, lvTwoInx } = props;
  const drawerRef = useRef(null);
  const [lvTwoTabIndex, setLvTwoTabIndex] = useState(lvTwoInx);

  const handleFirstClick = tab => {
    if (tab.id === -1) {
      return;
    } else if (tab.id === 0) {
      // window.location.href = "/index";
      props.history.push({ pathname: "/index" });
    } else {
      // window.location.href = "/channel/" + tab.id;
      props.history.push({ pathname: "/channel/" + tab.id });
    }
  }

  const handleSwitchClick = () => {
    drawerRef.current.show();
  }

  const handleSecondClick = tab => {
    setLvTwoTabIndex(tab.id);
    if (tab.id === 0) {
      // window.location.href = "/live";
      props.history.push({ pathname: "/live" });
    } else if (tab.id === 7) {
      // window.location.href = `/live/list` +
      //   `?parent_area_id=0` +
      //   `&parent_area_name=全部直播` +
      //   `&area_id=` +
      //   `&area_name=`
      props.history.push({
        pathname: "/live/list",
        search: `?parent_area_id=0` +
          `&parent_area_name=全部直播` +
          `&area_id=` +
          `&area_name=`
      });
    } else {
      const indx = tab.id - 1;
      const parent_area_id = props.secondQueryPar[indx].parent_area_id;
      const parent_area_name = props.secondQueryPar[indx].parent_area_name;
      const area_id = props.secondQueryPar[indx].area_id;
      const area_name = props.secondQueryPar[indx].area_name;
      // window.location.href = `/live/list` +
      //   `?parent_area_id=${parent_area_id}` +
      //   `&parent_area_name=${parent_area_name}` +
      //   `&area_id=${area_id}` +
      //   `&area_name=${area_name}`;
      props.history.push({
        pathname: "/live/list",
        search: `?parent_area_id=${parent_area_id}` +
          `&parent_area_name=${parent_area_name}` +
          `&area_id=${area_id}` +
          `&area_name=${area_name}`
      });
    }
  }

  return (
    <div className={style.head}>
      <Header />
      {/* 一级分类 */}
      <div className={style.partition}>
        <div className={style.tabBar}>
          <TabBar
            data={firstTabBarData}
            type={"indicate"}
            onClick={handleFirstClick}
            currentIndex={14}
          />
        </div>
        {/* 点击打开抽屉 */}
        <div className={style.switch} onClick={handleSwitchClick}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-arrowDownBig"></use>
          </svg>
        </div>
      </div>
      {/* 抽屉 */}
      <div className={style.drawerPosition}>
        <Drawer
          data={firstTabBarData}
          ref={drawerRef}
          onClick={handleFirstClick}
          currentIndex={14}
        />
      </div>
      {/* 二级分类 */}
      {
        <div className={style.secondTabBar}>
          <TabBar
            data={secondTabBarData}
            type={"hightlight"}
            currentIndex={lvTwoTabIndex}
            onClick={handleSecondClick}
          />
        </div>
      }
    </div>
  );
}

export default Nav;
