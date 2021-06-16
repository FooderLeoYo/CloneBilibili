import * as React from "react";
import { match } from "react-router-dom";
import { Helmet } from "react-helmet";

import { getFavDetail } from "../../../../api/space";
import Context from "../../../../context";
import { getPicSuffix } from "../../../../customed-methods/image";

import Header from "../../../../components/header/Header"
import VideoItemLandscape from "../../../../components/video-item-landscape/VideoItemLandscape";
import ScrollToTop from "../../../../components/scroll-to-top/ScrollToTop";

import style from "./fav.styl?css-modules";
import tips from "../../../../assets/images/nocontent.png";

interface FavProps {
  match: match<{ mlid }>;
}

const { useContext, useState, useEffect } = React;

function Fav(props: FavProps) {
  const { match } = props;
  const context = useContext(Context);

  const [infoData, setInfoData] = useState(null);
  const [listData, setListData] = useState(null);

  function getPicUrl(url, format) {
    const { picURL } = context;
    let suffix = ".webp";
    suffix = getPicSuffix();
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  useEffect(() => {
    getFavDetail(match.params.mlid, 15).then(result => {
      const { code, data } = result;
      if (code === "1") {
        const { info, medias } = data.data;
        setInfoData(info);
        setListData(medias);
      }
    })
  }, []);

  return (
    <>
      <Helmet><title>{infoData ? infoData.title : ""}</title></Helmet>
      <div className={style.header}><Header /></div>
      <div className={style.info}>
        <div className={style.imageContainer}>
          <span className={style.placeholder}>
            <svg className="icon" aria-hidden="true">
              <use href="#icon-placeholder"></use>
            </svg>
          </span>
          <img src={getPicUrl(infoData?.cover, "@320w_200h")} />
        </div>
        <div className={style.infoWrapper}>
          <div className={style.title}>{infoData?.title}</div>
          <div className={style.intro}>{infoData?.intro}</div>
          <div className={style.description}>{`创建者：${infoData?.upper.name}`}
          </div>
        </div>
      </div>
      <div className={style.statistic}>
        <div className={style.mediaCount}>{infoData?.media_count}个内容</div>
        {infoData?.attr != 0 && // 默认收藏夹无此项
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
      <div className={style.list}>
        {listData && listData.map((video, i) => {
          const { cnt_info, cover, duration, id, title, upper } = video;
          const { play, danmaku } = cnt_info;
          const tempData = {
            aId: id, title: title, pic: "", desc: "", playCount: play,
            barrageCount: danmaku, publicDate: 0, duration: duration, cId: 0,
            url: "", owner: upper.name, twoLevel: null, oneLevel: null
          };
          const tempParams = { imgHeight: "10.575rem", imgSrc: cover, imgFormat: "@320w_200h" }

          return (
            <div className={style.videoWrapper} key={i}><VideoItemLandscape videoData={tempData} imgParams={tempParams} /></div>
          )
        })}
      </div>
    </>
  )
}

export default Fav;
