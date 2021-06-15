import * as React from "react";
import { match } from "react-router-dom";

import { getFavListCreated, getFavListCollected, getFavInfo } from "../../../../../../../api/space";
import { getPicSuffix } from "../../../../../../../customed-methods/image";
import Context from "../../../../../../../context";

import FoldableList from "../../../../../../../components/foldable-list/FoldableList";

import style from "./video.styl?css-modules";

interface VideoProps {
  match: match<{ uid }>;
}

const { useState, useEffect, useContext, useMemo } = React;

function Video(props: VideoProps) {
  const { match } = props;

  const [favCreatedData, setFavCreatedData] = useState(null);
  const [favCollectedData, setFavCollectedData] = useState(null);
  const context = useContext(Context);

  function getPicUrl(url, format) {
    const { picURL } = context;
    let suffix = ".webp";
    suffix = getPicSuffix();
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  useEffect(() => {
    const { uid } = match.params;

    getFavListCreated(uid).then(result => {
      const { code, data } = result.data;
      if (code === 0) {
        const { count, list } = data;
        const tempData = { count: count, list: [] };
        getFavInfo(list[0].id).then(result => { // 保证“默认收藏夹”在第一位
          const { code, data } = result.data;
          if (code === 0) { tempData.list.push(data) }
          else { throw new Error(`No.0 has error: ${result.data.message}`) }
        }).then(() => {
          let finishedCount = 1;
          for (let i = 1; i < list.length; i++) {
            getFavInfo(list[i].id).then(result => {
              const { code, data } = result.data;
              if (code === 0) {
                tempData.list.push(data);
                ++finishedCount;
                // 这里不能直接用i判断是否都获取完了，因为先循环完(同步)再执行promise，这样靠后的i就可能先请求到数据
                finishedCount === count && setFavCreatedData(tempData);
              } else { throw new Error(`No.${i} has error: ${result.data.message}`) }
            });
          }
        }).catch(error => console.log(error));
      }
    });
    getFavListCollected(10, 1, uid).then(result => {
      const { code, data } = result.data;
      code === 0 && setFavCollectedData(data);
    });
  }, []);

  const favListCreated = useMemo(() => {
    if (favCreatedData) {
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
                  <div className={style.intro}>{intro}</div>
                  <div className={style.description}>
                    <span>{media_count}个内容&nbsp;&nbsp;&nbsp;·&nbsp;</span>
                    <span>{attr === 23 || attr === 55 ? "私密" : "公开"}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </>
      )
    }
    return null;
  }, [favCreatedData]);

  const favListCollected = useMemo(() => {
    if (favCollectedData) {
      return (
        <>
          {favCollectedData.list.map((fav, i) => {
            const { cover, media_count, title, upper } = fav;
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
                  <div className={style.description}>
                    <span>{media_count}个内容</span>
                    <span>&nbsp;&nbsp;&nbsp;·&nbsp;{upper.name}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </>
      )
    }
    return null;
  }, [favCollectedData]);

  return (
    <>
      <FoldableList swichTitle={"我的收藏与订阅"} stickyPosition={"4.25rem"} content={favListCollected} count={favCollectedData?.count} />
      <FoldableList swichTitle={"我创建的收藏夹"} stickyPosition={"4.25rem"} content={favListCreated} count={favCreatedData?.count} />
    </>
  )
}

export default Video;