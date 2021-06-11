import * as React from "react";
import { Helmet } from "react-helmet";
import { match, Link } from "react-router-dom";
import { History } from "history";

import { getFavListCreated, getFavListCollected, getSeriesFollowed } from "../../../../../api/space";

import Header from "../../child-components/header/Header"
import TabBar from "../../child-components/tab-bar/TabBar";
import ScrollToTop from "../../../../../components/scroll-to-top/ScrollToTop";

import style from "./favorites.styl?css-modules";

interface FavoritesProps {
  match: match<{ uid }>;
  history: History;
}

const { useState, useEffect } = React;

function Favorites(props: FavoritesProps) {
  const { match } = props;

  const [tabInx, setTabInx] = useState(0);
  const [bangumiPage, setBangumiPage] = useState(1);
  const [showPage, setShowPage] = useState(1);


  // const [shouldLoadShow, setShouldLoadShow] = useState(false);
  // useEffect(() => {
  //   console.log("tabInx: " + tabInx + '!!!!!!!!!!')
  //   console.log("shouldLoadBan: " + shouldLoadBan + "!!!!!!!!!")
  //   console.log("bangumiPage: " + bangumiPage + "!!!!!!!!!")
  //   shouldLoadBan && getDataByTabInx(tabInx)
  // }, [shouldLoadBan]);

  function getDataByTabInx(index: number) {
    const { uid } = match.params;

    console.log(bangumiPage)
    if (index === 0) {
      return;
    } else if (index === 1) {
      getSeriesFollowed(uid, 1, bangumiPage).then(result => {
        console.log(result)
      });
    } else if (index === 2) {
      getSeriesFollowed(uid, 2, showPage).then(result => {
        console.log(result)
      });
    }
  }

  const [shouldLoadBan, setShouldLoadBan] = useState(false);
  const [shouldLoadShow, setShouldLoadShow] = useState(false);
  useEffect(() => { shouldLoadBan && getDataByTabInx(tabInx); }, [bangumiPage]); // 为了保证bangumiPage + 1后才执行getDataByTabInx
  useEffect(() => { shouldLoadShow && getDataByTabInx(tabInx); }, [showPage]);
  function handleLoadMore() {
    if (tabInx === 1) {
      !shouldLoadBan && setShouldLoadBan(true);
      setBangumiPage(bangumiPage + 1)
    } else {
      !shouldLoadShow && setShouldLoadShow(true);
      setShowPage(showPage + 1);
    }
  }

  const [targetState, setTargetState] = useState("old");
  const [firstTime, setFirstTime] = useState(true);

  useEffect(() => {
    !firstTime && console.log(targetState) // "new"
  }, [targetState]);

  useEffect(() => {
    setFirstTime(false);
    setTimeout(() => {
      setTargetState("new");
    }, 5000);
  }, []);

  // useEffect(() => {
  //   const { uid } = match.params;

  //   getFavListCreated(uid).then(result => {
  //     console.log(result)
  //   });
  //   getFavListCollected(10, 1, uid).then(result => {
  //     console.log(result)
  //   });
  // }, []);



  return (
    <div className={style.favorites}>
      <Helmet><title>我的收藏</title></Helmet>
      <div className={style.topWrapper}><Header title={"我的收藏"} needEdit={true} /></div>
      <div className={style.tabWrapper}>
        <TabBar tabTitle={["视频", "追番", "追剧"]} setFatherCurInx={inx => setTabInx(inx)}
          curFatherInx={tabInx} doSthWithNewInx={index => getDataByTabInx(index)}
        />
      </div>
      <div className={style.listWrapper}>
        <div onClick={() => handleLoadMore()}>加载更多</div>
      </div>
      <ScrollToTop />
    </div>
  )
}

export default Favorites;
