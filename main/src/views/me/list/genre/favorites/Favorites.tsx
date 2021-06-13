import * as React from "react";
import { Helmet } from "react-helmet";
import { match, Link } from "react-router-dom";
import { History } from "history";

import {
  getFavListCreated, getFavListCollected, getSeriesFollowed, getFavInfo
} from "../../../../../api/space";
import Context from "../../../../../context";
import { getPicSuffix } from "../../../../../customed-methods/image";

import Header from "../../child-components/header/Header"
import TabBar from "../../child-components/tab-bar/TabBar";
import FoldableList from "../../child-components/foldable-list/FoldableList";
import ScrollToTop from "../../../../../components/scroll-to-top/ScrollToTop";

import style from "./favorites.styl?css-modules";

interface FavoritesProps {
  match: match<{ uid }>;
  history: History;
}

const { useState, useEffect, useContext, useMemo } = React;

function Favorites(props: FavoritesProps) {
  const { match } = props;

  const [tabInx, setTabInx] = useState(0);
  const [favCreatedData, setFavCreatedData] = useState(null);
  const [favCollectedData, setFavCollectedData] = useState(null);

  const context = useContext(Context);
  function getPicUrl(url, format) {
    const { picURL } = context;
    let suffix = ".webp";
    suffix = getPicSuffix();
    return `${picURL}?pic=${url}${format + suffix}`;
  }
  const content = useMemo(() => {
    if (favCreatedData) {
      console.log(favCreatedData)
      return (
        <>
          {favCreatedData.list.map((fav, i) => {
            const { attr, cover, intro, media_count, title } = fav;
            return (
              <div className={style.favItem} key={i}>
                <div className={style.imageContainer}>
                  <span className={style.placeholder}>
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-placeholder"></use>
                    </svg>
                  </span>
                  <img src={getPicUrl(cover, "@320w_200h")} />
                </div>
                <div className={style.infoWrapper}>
                  <div className={style.title}>{title}</div>
                  <div className={style.descriptions}>
                    <span>{media_count}个内容</span>
                    <span>公开</span>
                  </div>
                </div>
              </div>
            )
          })}
        </>
      )
    }
    return null;
  }, [favCreatedData?.list?.length]);

  console.log(favCreatedData?.list?.length)

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

  const [bangumiPage, setBangumiPage] = useState(1);
  const [showPage, setShowPage] = useState(1);
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

  useEffect(() => {
    const { uid } = match.params;

    getFavListCreated(uid).then(result => {
      const { code, data } = result.data;
      if (code === 0) {
        const { count, list } = data;
        const tempData = { count: count, list: [] };
        list.forEach((fav, i) => {
          getFavInfo(fav.id).then(result => {
            const { code, data } = result.data;
            code === 0 && tempData.list.push(data);
            i === count - 1 && setFavCreatedData(tempData);
            i === count - 1 && console.log("赋值完成")
          })
        });
      }
    });
    getFavListCollected(10, 1, uid).then(result => {
      const { data } = result;
      data.code === 0 && setFavCollectedData(data.data);
    });
  }, []);

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
        <FoldableList swichTitle={"我创建的收藏夹"} content={content} count={favCreatedData?.count} />
        {/* <FoldableList swichTitle={"我的收藏与订阅"} content={content} count={favCollectedData?.count} /> */}
        <div onClick={() => handleLoadMore()}>加载更多</div>
      </div>
      <ScrollToTop />
    </div>
  )
}

export default Favorites;
