import * as React from "react";
import { History } from "history";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { getHistory, deleteHistory } from "@api/me";

import Toast from "@components/toast/index";
import HeaderWithBottom from "@components/header-with-bottom/HeaderWithBottom"
import ScrollToTop from "@components/scroll-to-top/ScrollToTop";
import TabBar from "../../child-components/tab-bar/TabBar";
import VideoItem from "./child-components/item/VideoItem";
import BottomBar from "../../child-components/bottom-bar/BottomBar"

import style from "./my-history.styl?css-modules";
import tips from "@assets/images/nocontent.png";

interface MyHistoryProps {
  history: History;
  type: string;
}

interface MyHistoryState {
  videoHistories: Array<[string, Array<any>]>;
  liveHistories: Array<[string, Array<any>]>;
  searchKey: string;
  searchResult: { video: Array<any>; live: Array<any>; };
  noVideoHistory: boolean;
  noLiveHistory: boolean;
  tabInx: number;
  editting: boolean;
  selectedStatus: number; // 0为全不选，1为全选，2为选部分
}

class MyHistory extends React.Component<MyHistoryProps, MyHistoryState> {
  constructor(props) {
    super(props);
    this.state = {
      videoHistories: [],
      liveHistories: [],
      searchKey: "",
      searchResult: { video: [], live: [] },
      noVideoHistory: false,
      noLiveHistory: false,
      tabInx: 0,
      editting: false,
      selectedStatus: 0
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
    getHistory(0, "", 30).then(res => {
      const videoMap: Map<string, []> = new Map();
      const liveMap: Map<string, []> = new Map();
      const tempSearchRes = { video: [], live: [] };
      const updateMap = (map, view_at, record) => {
        const key = this.getDateKey(view_at);
        const tempRecord = record;
        tempRecord.selected = false; // 添加“是否被选中”属性，用于全选
        let tempHistory = map.get(key);

        if (tempHistory) {
          tempHistory.push(tempRecord);
        } else {
          tempHistory = new Array();
          tempHistory.push(tempRecord);
          map.set(key, tempHistory);
        }
      }

      res.data.data.list.forEach(record => {
        const { history, view_at } = record;
        if (history.business === "archive") {
          updateMap(videoMap, view_at, record);
          tempSearchRes.video.push(record);
        } else if (history.business === "live") {
          updateMap(liveMap, view_at, record);
          tempSearchRes.live.push(record);
        }
      });

      if (videoMap.size === 0) { this.setState({ noVideoHistory: true }) }
      else { this.setState({ videoHistories: [...videoMap] }); }
      if (liveMap.size === 0) { this.setState({ noLiveHistory: true }) }
      else { this.setState({ liveHistories: [...liveMap] }); }
      if (videoMap.size !== 0 || liveMap.size !== 0) {
        const { searchResult } = this.state;
        const { video, live } = tempSearchRes;
        videoMap.size !== 0 && (searchResult.video = video);
        liveMap.size !== 0 && (searchResult.live = live);
        this.setState({ searchResult: searchResult });
      }
    });
  }

  private setAllSelectedStatus(type: number, status: number) {   // type：0为video，1为live；status同state.selectedStatus
    const histories = type === 0 ? this.state.videoHistories : this.state.liveHistories;
    histories.forEach(item =>
      item[1].forEach(record => { record.selected = status === 0 ? false : true })
    );
    type === 0 ? this.setState({ videoHistories: histories }) : this.setState({ liveHistories: histories });
    this.setState({ selectedStatus: status });
  }

  private checkAllSelectedStatus(type: number) {  // type：0为video，1为live
    const histories = type === 0 ? this.state.videoHistories : this.state.liveHistories;
    let allSelected = true;
    let allCancled = true;
    histories.forEach(item => {
      item[1].forEach(record => {
        if (record.selected) { allCancled = false }
        else { allSelected = false }
      })
    })

    if (allCancled) { this.setAllSelectedStatus(type, 0) }
    else if (allSelected) { this.setAllSelectedStatus(type, 1) }
    else { this.setState({ selectedStatus: 2 }) }
  }

  private handleDelete = async () => {
    const { tabInx, videoHistories, liveHistories } = this.state;
    const histories = tabInx === 0 ? videoHistories : liveHistories;
    let hasProblem = false;

    await histories.map(item => {
      if (hasProblem) { return }

      item[1].map(record => {
        const { history, kid, selected } = record;
        selected && deleteHistory(tabInx === 0 ? `archive_${history.oid}` : `live_${kid}`)
          .then(result => {
            const { code, data } = result;
            if (code === 0) {
              Toast.warning('哇！服务器太忙了，您稍等片刻昂o(TヘTo)', false, null, 2000);
              hasProblem = true;
              return;
            }
            else {
              const { code, message } = data;
              if (code != 0) {
                Toast.error(message, false, null, 2000);
                hasProblem = true;
                return;
              }
            }
          });
      })
    });

    !hasProblem && Toast.success("删除成功！", false, null, 2000);
    setTimeout(() => {
      this.setHistoryData();
      this.setState({ editting: false });
    }, 2000);
  }

  private handleEdit = () => {
    this.setAllSelectedStatus(0, 0);
    this.setAllSelectedStatus(1, 0);
    this.setState({ editting: !this.state.editting, selectedStatus: 0 });
  };

  private setKeyword = (keyword: string) => this.setState({ searchKey: keyword });

  private getSearchRes = () => {
    const { searchResult, searchKey } = this.state;
    searchResult.video = searchResult.video.map(record => { if (record.title === searchKey) { return record } });
    searchResult.live = searchResult.live.map(record => record.title === searchKey);
    this.setState({ searchResult: searchResult });
  }

  public componentDidMount() {
    this.setHistoryData();
  }

  public componentDidUpdate(prevProps, prevState) {
    // console.log(this.state.searchKey)
    this.state.searchResult !== prevState.searchResult && this.getSearchRes();
  }

  public render() {
    const { history } = this.props;
    const { editting, noVideoHistory, videoHistories, noLiveHistory, liveHistories,
      tabInx, selectedStatus } = this.state;
    const videoList = (
      <div className={style.videoHistory}>
        {!noVideoHistory ?
          videoHistories.map((item, i) => (
            <ul className={style.viewedTimeGroup} key={`video${i}`}>
              {/* item[0]是map的键，item[1]是值 */}
              <div className={style.groupTitle}>{item[0]}</div>
              {item[1].map((record, j) => {
                return (
                  <li className={style.itemWrapper} key={j}>
                    <VideoItem history={history} curFatherInx={tabInx} record={record}
                      switchSelected={() => {
                        record.selected = !record.selected;
                        this.setState({ videoHistories: this.state.videoHistories });
                        this.checkAllSelectedStatus(0);
                      }}
                      editting={editting} selectedStatus={selectedStatus}
                    />
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
        {!noLiveHistory ?
          liveHistories.map((item, i) => (
            <ul className={style.viewedTimeGroup} key={`live${i}`}>
              <div className={style.groupTitle}>{item[0]}</div>
              {item[1].map((record, j) => {
                return (<li className={style.itemWrapper} key={j}>
                  <VideoItem history={history} curFatherInx={tabInx} record={record}
                    switchSelected={() => {
                      record.selected = !record.selected;
                      this.setState({ liveHistories: this.state.liveHistories });
                      this.checkAllSelectedStatus(1);
                    }}
                    editting={editting} selectedStatus={selectedStatus} />
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
        <HeaderWithBottom title={"历史记录"} mode={2} editting={editting} handleEdit={this.handleEdit}
          setKeyword={this.setKeyword}
        />
        <TabBar tabTitle={["视频", "直播"]} setFatherCurInx={inx => this.setState({ tabInx: inx })}
          curFatherInx={tabInx} doSthWithNewInx={() => this.setState({ editting: false, selectedStatus: 0 })}
        />
        <div className={style.listWrapper}>{tabInx === 0 ? videoList : liveList}</div>
        {editting && <div className={style.bottomWrapper}>
          <BottomBar
            selectedStatus={selectedStatus} handleDelete={this.handleDelete}
            setAllSelectedStatus={status => this.setAllSelectedStatus(tabInx, status)}
          />
        </div>
        }
        <ScrollToTop />
      </div>
    );
  }
}


export default MyHistory;