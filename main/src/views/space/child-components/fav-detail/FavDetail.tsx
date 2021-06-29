import * as React from "react";
import { Helmet } from "react-helmet";
import { parse } from "query-string";
import { Location } from "history";

import { getFavDetail } from "@api/space";
import { delInvalidFavContent } from "@api/me";
import Context from "@context/index";
import { getPicSuffix } from "@customed-methods/image";

import HeaderWithTools from "@components/header-with-tools/HeaderWithTools"
import VideoItemLandscape from "@components/video-item-landscape/VideoItemLandscape";
import ScrollToTop from "@components/scroll-to-top/ScrollToTop";
import Edit from "@root/src/views/me/list/genre/fav/child-components/edit/Edit";

import style from "./fav-detail.styl?css-modules";

interface FavDetailProps {
  location: Location;
}

const { useContext, useState, useRef, useEffect } = React;

function FavDetail(props: FavDetailProps) {
  const { search } = props.location;
  const context = useContext(Context);

  const [pageStatus, setPageStatus] = useState(0); // 0为收藏夹内容，1为编辑收藏夹
  const [infoData, setInfoData] = useState(null);
  const [listData, setListData] = useState(null);
  const headerRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const overlayRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const staRef: React.MutableRefObject<HTMLDivElement> = useRef(null);
  const listRef: React.MutableRefObject<HTMLDivElement> = useRef(null);

  const queries = parse(search.substring(search.indexOf("?")));
  const { favid, uid } = queries;
  const favID = parseInt(favid as string);
  const notDefault = infoData?.attr !== 0;
  const needEllipsis = notDefault && infoData?.upper?.mid === parseInt(uid as string);

  function getPicUrl(url, format) {
    const { picURL } = context;
    let suffix = ".webp";
    suffix = getPicSuffix();
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  const setInfoAndList = () => {
    getFavDetail(favID, 15).then(result => {
      const { code, data } = result;
      if (code === "1") {
        const { info, medias } = data.data;
        setInfoData(info);
        setListData(medias);
        // 在list不够长时，保证上拉时statistic也能贴着header
        const heightWithoutTop = screen.height - headerRef.current.offsetHeight - staRef.current.offsetHeight;
        const listDOM = listRef.current;
        if (listDOM.offsetHeight < heightWithoutTop) { listDOM.style.height = `${heightWithoutTop}px` }
      }
    });
  };

  const handleEditInfo = needEllipsis ? () => {
    setPageStatus(1);
  } : null;

  const handleMulManage = needEllipsis ? () => {
  } : null;

  const handleCleanInvalid = needEllipsis ? () => {
    delInvalidFavContent(favID).then(() => setInfoAndList())
  } : null;

  const handleDelete = needEllipsis ? () => {
  } : null;

  useEffect(() => {
    const headerHeight = headerRef.current.offsetHeight;
    const infoHeight = overlayRef.current.offsetHeight;
    const staDOM = staRef.current;
    staDOM.addEventListener("touchmove", () => {
      const toHeader = staDOM.getBoundingClientRect()["top"] - headerHeight;
      const ratio = 1 - toHeader / infoHeight;
      if (ratio < 1) { overlayRef.current.style.opacity = `${ratio}` }
    });
    listRef.current.addEventListener("touchmove", () => {
      const toHeader = staDOM.getBoundingClientRect()["top"] - headerHeight;
      const ratio = 1 - toHeader / infoHeight;
      if (ratio < 1) { overlayRef.current.style.opacity = `${ratio}` }
    });
  }, []);

  useEffect(() => {
    pageStatus === 0 && setInfoAndList();
  }, [pageStatus]);

  return (
    <div className={style.favDetail}>
      <Helmet><title>{pageStatus === 0 ? infoData?.title : "编辑信息"}</title></Helmet>
      {pageStatus === 0 ?
        <>
          <div className={style.header} ref={headerRef}>
            <HeaderWithTools mode={needEllipsis ? 1 : 0} title={infoData?.title}
              handleEditInfo={handleEditInfo} handleMulManage={handleMulManage}
              handleCleanInvalid={handleCleanInvalid} handleDelete={handleDelete}
            />
          </div>
          <div className={style.info}>
            <div className={style.imageContainer}>
              {infoData?.cover ? <img className={style.cover} src={getPicUrl(infoData.cover, "@320w_200h")} /> :
                <span className={style.placeholder}>
                  <svg className="icon" aria-hidden="true">
                    <use href="#icon-placeholder"></use>
                  </svg>
                </span>
              }
            </div>
            {infoData &&
              <div className={style.description}>
                <div className={style.title}>{infoData?.title}</div>
                <div className={style.intro}>{infoData?.intro}</div>
                <div className={style.creator}>{`创建者：${infoData?.upper.name}`}
                </div>
              </div>
            }
            <div className={style.overlay} ref={overlayRef} />
          </div>
          <div className={style.statistic} ref={staRef}>
            <div className={style.mediaCount}>{infoData?.media_count}个内容</div>
            {notDefault &&
              <div className={style.likeStatistic}>
                <div className={style.item}>
                  <span className={style.icon}>
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-playCount"></use>
                    </svg>
                  </span>
                  <span className={style.count}>{infoData?.cnt_info.play}</span>
                </div>
                <div className={style.item}>
                  <span className={style.icon}>
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-thumbUp"></use>
                    </svg>
                  </span>
                  <span className={style.count}>{infoData?.cnt_info.thumb_up}</span>
                </div>
                <div className={style.item}>
                  <span className={style.icon}>
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-favorites"></use>
                    </svg>
                  </span>
                  <span className={style.count}>{infoData?.cnt_info.collect}</span>
                </div>
              </div>
            }
          </div>
          <div className={style.list} ref={listRef}>
            {listData && listData.map((video, i) => {
              const { cnt_info, cover, duration, id, title, upper } = video;
              const { play, danmaku } = cnt_info;
              const tempData = {
                aId: id, title: title, pic: "", desc: "", playCount: play,
                barrageCount: danmaku, publicDate: 0, duration: duration, cId: 0,
                url: "", owner: upper, twoLevel: null, oneLevel: null
              };
              const tempParams = { imgHeight: "10.575rem", imgSrc: cover, imgFormat: "@320w_200h" }

              return (
                <div className={style.videoWrapper} key={i}><VideoItemLandscape videoData={tempData} imgParams={tempParams} /></div>
              )
            })}
          </div>
          <ScrollToTop />
        </> :
        <Edit editType={0} media_id={favID} intro={infoData?.intro}
          privacy={infoData?.attr !== 23 && infoData?.attr !== 55 ? 0 : 1}
          title={infoData?.title} handleBack={() => setPageStatus(0)}
        />
      }
    </div>
  )
}

export default FavDetail;
