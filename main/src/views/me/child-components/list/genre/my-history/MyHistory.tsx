import * as React from "react";
import { History } from "history";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { getViewedHistory } from "../../../../../../api/space";

import Header from "../../child-components/header/Header"
import TabBar from "../../child-components/tab-bar/TabBar";
import VideoItem from "../../child-components/item/VideoItem";
import BottomBar from "../../child-components/bottom-bar/BottomBar"
import ScrollToTop from "../../../../../../components/scroll-to-top/ScrollToTop";

import style from "./my-history.styl?css-modules";
import tips from "../../../../../../assets/images/nocontent.png";

interface MyHistoryProps {
  history: History;
  type: string;
}

interface MyHistoryState {
  videoHistories: Array<[string, Array<any>]>;
  liveHistories: Array<[string, Array<any>]>;
  noVideoHistory: boolean;
  noLiveHistory: boolean;
  tabInx: number;
  editting: boolean;
  allSelected: boolean;
}

class MyHistory extends React.Component<MyHistoryProps, MyHistoryState> {
  constructor(props) {
    super(props);
    this.state = {
      videoHistories: [],
      liveHistories: [],
      noVideoHistory: false,
      noLiveHistory: false,
      tabInx: 0,
      editting: false,
      allSelected: false
    }
  }

  private getDateKey(timestamp) {
    const currentTime = new Date();
    const dateTime = new Date(timestamp * 1000);

    if (currentTime.getFullYear() === dateTime.getFullYear() &&
      currentTime.getMonth() === dateTime.getMonth()) {
      const diffDate = currentTime.getDate() - dateTime.getDate();

      switch (diffDate) {
        case 0:
          return "今天";
        case 1:
          return "昨天";
        case 2:
          return "前天";
        default:
          return "更早";
      }
    } else {
      return "更早";
    }
  }

  private setHistoryData() {
    getViewedHistory(0, "", 30).then(res => {
      const videoMap: Map<string, []> = new Map();
      const liveMap: Map<string, []> = new Map();
      const updateMap = (map, view_at, record) => {
        const key = this.getDateKey(view_at);
        let temHistory = map.get(key);
        if (temHistory) {
          temHistory.push(record);
        } else {
          temHistory = new Array();
          temHistory.push(record);
          map.set(key, temHistory);
        }
      }

      res.data.data.list.forEach(record => {
        const { history, view_at } = record;
        if (history.business === "archive") { updateMap(videoMap, view_at, record); }
        else if (history.business === "live") { updateMap(liveMap, view_at, record); }
      });

      if (videoMap.size === 0) { this.setState({ noVideoHistory: true }) }
      else { this.setState({ videoHistories: [...videoMap] }); }
      if (liveMap.size === 0) { this.setState({ noLiveHistory: true }) }
      else { this.setState({ liveHistories: [...liveMap] }); }

    });
  }

  public componentDidMount() {
    this.setHistoryData();
  }

  public render() {
    const { history } = this.props;
    const { editting, noVideoHistory, videoHistories, noLiveHistory, liveHistories,
      tabInx, allSelected } = this.state;
    const videoList = (
      <div className={style.videoHistory}>
        { !noVideoHistory ?
          videoHistories.map((item, i) => (
            <ul className={style.viewedTimeGroup} key={`video${i}`}>
              {/* item[0]是map的键，item[1]是值 */}
              <div className={style.groupTitle}>{item[0]}</div>
              { item[1].map((record, i) => {
                return (
                  <li className={style.itemWrapper} key={i}>
                    <VideoItem history={history} curFatherInx={tabInx} record={record}
                      editting={editting} allSelected={allSelected} />
                  </li>
                )
              })}
            </ul>
          )) :
          <div className={style.tips}>
            <img src={tips} />
            <div className={style.text}>你还没有视频观看历史记录</div>
            <div className={style.text}>快去发现&nbsp;<Link to="/index">新内容</Link>&nbsp;吧！</div>
          </div>
        }
      </div>
    );
    const liveList = (
      <div className={style.liveHistory}>
        { !noLiveHistory ?
          liveHistories.map((item, i) => (
            <ul className={style.viewedTimeGroup} key={`live${i}`}>
              <div className={style.groupTitle}>{item[0]}</div>
              { item[1].map((record, i) => {
                return (<li className={style.itemWrapper} key={i}>
                  <VideoItem history={history} curFatherInx={tabInx} record={record}
                    editting={editting} allSelected={allSelected} />
                </li>)
              })}
            </ul>
          )) :
          <div className={style.tips}>
            <img src={tips} />
            <div className={style.text}>你还没有视频观看历史记录</div>
            <div className={style.text}>快去发现&nbsp;<Link to="/live">新直播</Link>&nbsp;吧！</div>
          </div>
        }
      </div>
    );

    return (
      <div className={style.myHistory}>
        <Helmet><title>历史记录</title></Helmet>
        <div className={style.topWrapper}>
          <Header title={"历史记录"} needEdit={true} editting={editting} setEditting={() => this.setState({ editting: !editting })} />
        </div>
        <div className={style.tabWrapper}>
          <TabBar tabTitle={["视频", "直播"]} setFatherCurInx={inx => this.setState({ tabInx: inx })} curFatherInx={tabInx} />
        </div>
        <div className={style.listWrapper}>{tabInx === 0 ? videoList : liveList}</div>
        <div className={style.bottomWrapper}>
          <BottomBar allSelected={allSelected} setAllSelected={() => this.setState({ allSelected: !allSelected })} />
        </div>
        <ScrollToTop />
        <div className={style.btn} onClick={() => this.setState({ allSelected: !allSelected })}>{allSelected ? "全选" : "反选"}</div>
      </div>
    );
  }
}


export default MyHistory;