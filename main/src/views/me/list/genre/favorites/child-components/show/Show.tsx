import * as React from "react";
import { match } from "react-router-dom";
import LazyLoad from "react-lazyload";

import { getSeriesFollowed } from "../../../../../../../api/space";
import Context from "../../../../../../../context";
import { getPicSuffix } from "../../../../../../../customed-methods/image";

import style from "./show.styl?css-modules";

interface ShowProps {
  match: match<{ uid }>;
  fatherInx: number;
}

const { useState, useEffect, useContext } = React;

function Show(props: ShowProps) {
  const { match, fatherInx } = props
  const context = useContext(Context);
  const [banData, setBanData] = useState({ list: [], pn: 1, ps: 15, total: 0 });
  const [showData, setShowData] = useState({ list: [], pn: 1, ps: 15, total: 0 });

  function getPicUrl(url, format) {
    const { picURL } = context;
    let suffix = ".webp";
    suffix = getPicSuffix();
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  function getDataByTabInx(index: number) {
    const { uid } = match.params;

    if (index === 0) {
      return;
    } else if (index === 1) {
      getSeriesFollowed(uid, 1, banData.pn).then(result => {
        const { code, data } = result.data;
        if (code === 0) {
          const { list, pn, total } = data;
          // 必须借助一个变量
          // 不能直接修改banData的属性再setBanData，因为这样banData地址没变，setBanData不会触发重渲染
          const temp = { ...banData }; // 深拷贝
          if (banData.pn === 1) { temp.total = total }
          temp.list = banData.list.concat(list);
          temp.pn = pn;
          setBanData(temp);
        }
      });
    } else if (index === 2) {
      getSeriesFollowed(uid, 2, showData.pn).then(result => {
        const { code, data } = result.data;
        if (code === 0) {
          const { list, pn, total } = data;
          const temp = { ...showData };
          if (showData.pn === 1) { temp.total = total }
          temp.list = showData.list.concat(list);
          temp.pn = pn;
          setShowData(temp);
        }
      });
    }
  }

  function handleLoadMore() {
    if (fatherInx === 1) {
      const temp = { ...banData };
      ++temp.pn;
      setBanData(temp);
    }
    else {
      const temp = { ...showData };
      ++temp.pn;
      setShowData(temp);
    }
  }

  useEffect(() => { fatherInx === 1 && getDataByTabInx(fatherInx) }, [banData.pn, fatherInx]); // 为了保证bangumiPage + 1后才执行getDataByTabInx
  useEffect(() => { fatherInx === 2 && getDataByTabInx(fatherInx) }, [showData.pn, fatherInx]);

  return (
    <>
      {fatherInx === 1 ?
        <ul className={style.banList}>
          {banData.list.length > 0 && banData.list.map((bangumi, i) => {
            const { badge_infos, cover, new_ep, progress, subtitle, title } = bangumi;
            return (
              <li className={style.item} key={`bangumi${i}`}>
                <div className={style.imageContainer}>
                  <span className={style.placeholder}>
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-placeholder"></use>
                    </svg>
                  </span>
                  <LazyLoad height={"10.575rem"}><img className={style.cover} src={getPicUrl(cover, "@150w_200h")} /></LazyLoad>
                </div>
                <div className={style.infoWrapper}>
                  <span className={style.title}>{title}</span>
                  <span className={style.badges}>
                    {badge_infos?.vip_or_pay && <span className={style.vip}>{badge_infos.vip_or_pay.text}</span>}
                    {badge_infos?.content_attr && <span className={style.sole}>{badge_infos.content_attr.text}</span>}
                  </span>
                  <span className={style.subtitle}>{subtitle}</span>
                  <span className={style.total}>{new_ep.index_show}</span>
                  <span className={style.progress}>{progress != "" ? progress : "尚未观看"}</span>
                </div>
              </li>
            )
          })}
          {banData.list.length < banData.total ?
            <li className={style.loadMore} onClick={() => handleLoadMore()}>加载更多</li> :
            <li className={style.nothing}>再怎么找也没有啦</li>
          }
        </ul> :
        <ul className={style.showList}>
          {showData.list.length > 0 && showData.list.map((show, i) => {
            const { badge_infos, cover, new_ep, progress, subtitle, title } = show;
            return (
              <li className={style.item} key={`bangumi${i}`}>
                <div className={style.imageContainer}>
                  <span className={style.placeholder}>
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-placeholder"></use>
                    </svg>
                  </span>
                  <LazyLoad height={"10.575rem"}><img className={style.cover} src={getPicUrl(cover, "@150w_200h")} /></LazyLoad>
                </div>
                <div className={style.infoWrapper}>
                  <span className={style.title}>{title}</span>
                  <span className={style.badges}>
                    {badge_infos?.vip_or_pay && <span className={style.vip}>{badge_infos.vip_or_pay.text}</span>}
                    {badge_infos?.content_attr && <span className={style.sole}>{badge_infos.content_attr.text}</span>}
                  </span>
                  <span className={style.subtitle}>{subtitle}</span>
                  <span className={style.total}>{new_ep.index_show}</span>
                  <span className={style.progress}>{progress != "" ? progress : "尚未观看"}</span>
                </div>
              </li>
            )
          })}
          {showData.list.length < showData.total ?
            <li className={style.loadMore} onClick={() => handleLoadMore()}>加载更多</li> :
            <li className={style.nothing}>再怎么找也没有啦</li>
          }
        </ul>
      }
    </>
  )
}

export default Show;
