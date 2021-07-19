import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { getLater } from "@api/me";

import HeaderWithTools, { BatchDelItem } from "@components/header-with-tools/HeaderWithTools"
import VideoItemLandscape from "@components/video-item-landscape/VideoItemLandscape";
import ScrollToTop from "@components/scroll-to-top/ScrollToTop";

import tips from "@assets/images/nocontent.png";
import style from "./later.styl?css-modules";

const { useState, useRef, useEffect } = React;

function Later() {
  const [laterData, setLaterData] = useState([]);
  const headerRef: React.MutableRefObject<any> = useRef(null);
  // 批量删除相关
  const tempBatDelList = [];
  const [batchDelList, setBatchDelList] = useState([]);
  const [mulDeleting, setMulDeleting] = useState(false);
  // 搜索相关
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  const handleMulDel = () => {
    console.log("批量删除")
  };

  const accessTarKey = (data, findAndHightlight) => findAndHightlight(data, "title");

  useEffect(() => {
    getLater().then(result => {
      const { code, data } = result.data;
      if (code === 0) {
        const list = data.list.map(video => {
          const { aid, title, pic, desc, stat, ctime, duration, cid, uri, owner } = video;
          const { view, danmaku } = stat;
          return {
            aId: aid,
            title: title,
            pic: pic,
            desc: desc,
            playCount: view,
            barrageCount: danmaku,
            publicDate: ctime,
            duration: duration,
            cId: cid,
            url: uri,
            owner: owner,
            selected: false
          };
        })
        setLaterData(list);
      }
    })
  }, []);

  return (
    <div className={style.later}>
      <Helmet><title>稍后再看</title></Helmet>
      <HeaderWithTools ref={headerRef} title={"稍后再看"} mode={2}
        // 搜索相关
        searching={searching} searchKey={searchKey} setSearchKey={setSearchKey}
        dataForSearch={laterData} setSearchResult={setSearchResult} accessTarKey={accessTarKey}
        setSearching={(bool: boolean) => setSearching(bool)}
        setSearched={(bool: boolean) => setSearched(bool)}
        // 批量删除相关
        tempBatDelList={tempBatDelList} batchDelList={batchDelList}
        mulDeleting={mulDeleting} handleMulDel={handleMulDel}
        setBatchDelList={list => setBatchDelList(list)}
        setMulDeleting={status => setMulDeleting(status)}
      />
      <div className={style.listWrapper}>
        {laterData.length > 0 ?
          searching && searched ?
            <ul className={style.searchResult}>
              <li className={style.total}>{`共找到关于“${searchKey}”的${searchResult.length}个内容`}</li>
              {searchResult.map((video, i) =>
                <li className={style.itemWrapper} key={`search${i}`}>
                  <VideoItemLandscape videoData={video}
                    imgParams={{ imgHeight: "5.875rem", imgSrc: video.pic, imgFormat: "@200w_125h" }}
                  />
                </li>
              )}
            </ul> :
            <ul className={style.laterList}>
              {laterData?.map((video, i) => {
                tempBatDelList.push(video);
                const curInx = tempBatDelList.length - 1;
                return (
                  <li className={style.videoItem} key={`later${i}`}>
                    <BatchDelItem batchDelList={batchDelList} setBatchDelList={setBatchDelList}
                      mulDeleting={mulDeleting} batDelItemInx={curInx} header={headerRef.current}
                      itemDOM={
                        <VideoItemLandscape videoData={video} disableLink={mulDeleting}
                          imgParams={{ imgHeight: "5.875rem", imgSrc: video.pic, imgFormat: "@200w_125h" }}
                        />}
                    />
                  </li>)
              })}
            </ul> :
          <div className={style.noVideo}>
            <img src={tips} />
            <div className={style.text}>你还没有添加稍后再看的视频</div>
            <div className={style.text}>快去发现&nbsp;<Link to="/index">新内容</Link>&nbsp;吧！</div>
          </div>
        }
      </div>
      <ScrollToTop />
    </div>
  )
}

export default Later;
