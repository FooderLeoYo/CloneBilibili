import * as React from "react";
import { Helmet } from "react-helmet";
import { match } from "react-router-dom";

import HeaderWithTools from "@root/src/components/header-with-tools/HeaderWithTools"
import TabBar from "../../child-components/tab-bar/TabBar";
import Video from "./child-components/video/Video";
import Show from "./child-components/show/Show";
import ScrollToTop from "@components/scroll-to-top/ScrollToTop";

import style from "./favorites.styl?css-modules";

interface FavoritesProps {
  match: match<{ uid }>;
}

const { useState } = React;

function Favorites(props: FavoritesProps) {
  const { match } = props;
  const [tabInx, setTabInx] = useState(0);

  return (
    <div className={style.favorites}>
      <Helmet><title>我的收藏</title></Helmet>
      <HeaderWithTools title={"我的收藏"} mode={3} />
      <TabBar tabTitle={["视频", "追番", "追剧"]} curFatherInx={tabInx}
        setFatherCurInx={inx => setTabInx(inx)}
      />
      <div className={style.listWrapper}>
        {tabInx === 0 ? <Video match={match} /> : <Show match={match} fatherInx={tabInx} />}
      </div>
      <ScrollToTop />
    </div>
  )
}

export default Favorites;
