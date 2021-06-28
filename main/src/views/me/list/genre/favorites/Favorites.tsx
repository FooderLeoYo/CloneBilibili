import * as React from "react";
import { Helmet } from "react-helmet";
import { match } from "react-router-dom";

import HeaderWithTools from "@components/header-with-tools/HeaderWithTools"
import ScrollToTop from "@components/scroll-to-top/ScrollToTop";
import TabBar from "../../child-components/tab-bar/TabBar";
import Edit from "./child-components/edit/Edit";
import Video from "./child-components/video/Video";
import Show from "./child-components/show/Show";

import style from "./favorites.styl?css-modules";

interface FavoritesProps {
  match: match<{ uid }>;
}

const { useState } = React;

function Favorites(props: FavoritesProps) {
  const { uid } = props.match.params;
  const [pageStatus, setPageStatus] = useState(0); // 0为收藏列表，1为新增收藏夹
  const [tabInx, setTabInx] = useState(0);

  return (
    <div className={style.favorites}>
      <Helmet><title>{pageStatus === 0 ? "我的收藏" : "创建"}</title></Helmet>
      {pageStatus === 0 ?
        <>
          <HeaderWithTools title={"我的收藏"} mode={3} handleAdd={() => setPageStatus(1)} />
          <TabBar tabTitle={["视频", "追番", "追剧"]} curFatherInx={tabInx}
            setFatherCurInx={inx => setTabInx(inx)}
          />
          <div className={style.listWrapper}>
            {tabInx === 0 ? <Video uid={uid} /> : <Show uid={uid} fatherInx={tabInx} />}
          </div>
          <ScrollToTop />
        </> : <Edit editType={1} handleBack={() => setPageStatus(0)} />
      }
    </div>
  )
}

export default Favorites;
