import * as React from "react";
import { History } from "history";
import { parse } from "query-string";

import { PartitionType, LiveSecQueryParType } from "@class-object-creators/index";

import LogoHeader from "@root/src/components/logo-header/LogoHeader";
import TabBar from "@components/tab-bar/TabBar";
import Drawer from "@components/drawer/Drawer";

import style from "./nav.styl?css-modules";

interface NavProps {
  history: History,
  firstTabBarData: PartitionType[],
  lvTwoTabBarData: PartitionType[],
  secondQueryPar: LiveSecQueryParType[],
  sendLvTowInx?: any,
}

const { useState, useRef, useEffect } = React;

function Nav(props: NavProps) {
  const { firstTabBarData, lvTwoTabBarData, secondQueryPar, history } = props;
  const drawerRef = useRef(null);
  const [lvTwoTabIndex, setLvTwoTabIndex] = useState(0);
  const [firstTimeLoad, setFirstTimeLoad] = useState(true); // 从别的页面初次进入channel时不要动画，避免不自然滑动

  const handleFirstClick = tab => {
    if (tab.id === -1) {
      return;
    } else if (tab.id === 0) {
      // window.location.href = "/index";
      history.push({ pathname: "/index" });
    } else {
      // window.location.href = "/channel/" + tab.id;
      history.push({ pathname: "/channel/" + tab.id });
    }
  }

  const handleSwitchClick = () => {
    drawerRef.current.show();
  }

  const handleSecondClick = tab => {
    setLvTwoTabIndex(tab.id);
    if (tab.id === 0) {
      // window.location.href = "/live";
      history.push({ pathname: "/live" });
    } else if (tab.id === -1) {
      // window.location.href = `/live/list` +
      //   `?parent_area_id=0` +
      //   `&parent_area_name=全部直播` +
      //   `&area_id=` +
      //   `&area_name=`
      history.push({
        pathname: "/live/list",
        search: `?parent_area_id=0` +
          `&parent_area_name=全部直播` +
          `&area_id=` +
          `&area_name=`
      });
    } else {
      const indx = tab.id - 1;
      const parent_area_id = secondQueryPar[indx].parent_area_id;
      const parent_area_name = secondQueryPar[indx].parent_area_name;
      const area_id = secondQueryPar[indx].area_id;
      const area_name = secondQueryPar[indx].area_name;
      // window.location.href = `/live/list` +
      //   `?parent_area_id=${parent_area_id}` +
      //   `&parent_area_name=${parent_area_name}` +
      //   `&area_id=${area_id}` +
      //   `&area_name=${area_name}`;
      history.push({
        pathname: "/live/list",
        search: `?parent_area_id=${parent_area_id}` +
          `&parent_area_name=${parent_area_name}` +
          `&area_id=${area_id}` +
          `&area_name=${area_name}`
      });
    }

    if (firstTimeLoad) { setFirstTimeLoad(false); }
  }

  useEffect(() => {
    const searchValue = location.search;
    if (searchValue != "" && lvTwoTabBarData) {
      const { area_name, parent_area_name } = parse(searchValue);
      const queryName = area_name ? area_name : parent_area_name;
      const index = lvTwoTabBarData.findIndex(parittion => parittion.name === queryName);
      setLvTwoTabIndex(index);
    }
  }, [lvTwoTabBarData]);

  return (
    <div className={style.head}>
      <LogoHeader />
      {/* 一级分类 */}
      <div className={style.partition}>
        <div className={style.tabBar}>
          <TabBar data={firstTabBarData} needUnderline={true}
            clickMethod={handleFirstClick} currentIndex={15} noSlideAni={true}
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
        <Drawer data={firstTabBarData} ref={drawerRef}
          onClick={handleFirstClick} currentIndex={-1}
        />
      </div>
      {/* 二级分类 */}
      {lvTwoTabBarData &&
        <div className={style.secondTabBar}>
          <TabBar data={lvTwoTabBarData} currentIndex={lvTwoTabIndex}
            clickMethod={handleSecondClick} noSlideAni={firstTimeLoad} needForcedUpdate={true}
          />
        </div>
      }
    </div>
  );
}

export default Nav;
