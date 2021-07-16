import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { getLater } from "@api/me";

import HeaderWithTools, { BatchDelItem } from "@components/header-with-tools/HeaderWithTools"
import VideoItemLandscape from "@components/video-item-landscape/VideoItemLandscape";
import ScrollToTop from "@components/scroll-to-top/ScrollToTop";

import tips from "@assets/images/nocontent.png";
import style from "./later.styl?css-modules";

const { useState, useEffect } = React;

function Later() {
  const [laterData, setLaterData] = useState([]);
  const [mulDeleting, setMulDeleting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(0); // 0为全不选，1为全选，2为选部分
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  useEffect(() => {
    getLater().then(result => {
      const { code, data } = result.data;
      code === 0 && setLaterData(data.list.map(video => {
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
      }));
    })
  }, []);

  const setAllSelectedStatus = (status: number) => {
    const temp = [...laterData];
    temp.forEach(video => video.selected = status === 0 ? false : true);
    setLaterData(temp);
    setSelectedStatus(status);
  }

  const switchMulDel = () => {
    setAllSelectedStatus(0);
    setMulDeleting(!mulDeleting);
    setSelectedStatus(0);
  };

  const setKeyword = (keyword: string) => {
    setSearchKey(keyword);
    setSearched(true);
  }

  return (
    <div className={style.later}>
      <Helmet><title>稍后再看</title></Helmet>
      <HeaderWithTools title={"稍后再看"} mode={2} mulDeleting={mulDeleting}
        setKeyword={setKeyword} searching={searching}
        setSerching={(bool: boolean) => setSearching(bool)}
      />
      <ul className={style.laterList}>
        {laterData.length > 0 ?
          searching && searched ?
            <ul className={style.searchResult}>
              <li className={style.total}>{`共找到关于“${searchKey}”的${searchResult.length}个内容`}</li>
              {searchResult.map((video, i) =>
                <li className={style.itemWrapper} key={i}>
                  <VideoItemLandscape videoData={video}
                    imgParams={{ imgHeight: "5.875rem", imgSrc: video.pic, imgFormat: "@200w_125h" }}
                  />
                </li>
              )}
            </ul> :
            laterData?.map((video, i) => (
              <li className={style.videoItem} key={i}>
                <BatchDelItem mulDeleting={mulDeleting}
                  itemDOM={<VideoItemLandscape videoData={video}
                    imgParams={{ imgHeight: "5.875rem", imgSrc: video.pic, imgFormat: "@200w_125h" }}
                  />}
                />
              </li>
            )) :
          <div className={style.noVideo}>
            <img src={tips} />
            <div className={style.text}>你还没有添加稍后再看的视频</div>
            <div className={style.text}>快去发现&nbsp;<Link to="/index">新内容</Link>&nbsp;吧！</div>
          </div>
        }
      </ul>

      {/* <div className={style.laterList}>
        {!noVideoHistory ?
          searching && searched ?
            <ul className={style.searchResult}>
              <li className={style.total}>{`共找到关于“${searchKey}”的${searchResult.video.length}个内容`}</li>
              {searchResult.video.map((record, i) =>
                <li className={style.itemWrapper} key={i}>
                  <VideoItem history={history} curFatherInx={tabInx} record={record} />
                </li>
              )}
            </ul> :
            laterData.map((item, i) => (
              <ul className={style.viewedTimeGroup} key={`video${i}`}>
                {item[1].map((record, j) => {
                  return (
                    <li className={style.itemWrapper} key={j}>
                      <VideoItem history={history} curFatherInx={tabInx} record={record}
                        switchSelected={() => {
                          record.selected = !record.selected;
                          setState({ videoHistories: state.videoHistories });
                          checkAllSelectedStatus(0);
                        }}
                        mulDeleting={mulDeleting} selectedStatus={selectedStatus}
                      />
                    </li>
                  )
                })}
              </ul>
            )) :
          <div className={style.tips}>
            <img src={tips} />
            <div className={style.text}>你还没有添加稍后再看的视频</div>
            <div className={style.text}>快去发现&nbsp;<Link to="/index">新内容</Link>&nbsp;吧！</div>
          </div>
        }
      </div> */}
      <ScrollToTop />
    </div>
  )
}

export default Later;
