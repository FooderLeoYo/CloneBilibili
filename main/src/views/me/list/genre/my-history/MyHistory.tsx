import * as React from "react";
import { History } from "history";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { getHistory, deleteHistory } from "@api/me";

import Toast from "@components/toast/index";
import HeaderWithTools from "@components/header-with-tools/HeaderWithTools"
import ScrollToTop from "@components/scroll-to-top/ScrollToTop";
import TabBar from "../../child-components/tab-bar/TabBar";
import VideoItem from "./child-components/item/VideoItem";

import tips from "@assets/images/nocontent.png";
import style from "./my-history.styl?css-modules";

interface MyHistoryProps {
  history: History;
  type: string;
}

interface MyHistoryState {
  videoHistories: Array<[string, Array<any>]>;
  liveHistories: Array<[string, Array<any>]>;
  searchKey: string;
  searchList: { video: Array<any>; live: Array<any>; };
  searchResult: { video: Array<any>; live: Array<any>; };
  searching: boolean;
  searched: boolean;
  noVideoHistory: boolean;
  noLiveHistory: boolean;
  tabInx: number;
  mulDeleting: boolean;
  batchDelList: Array<any>;
}

class MyHistory extends React.Component<MyHistoryProps, MyHistoryState> {
  private tempBatDelList: Array<any>;
  private headerRef: React.MutableRefObject<any>;
  constructor(props) {
    super(props);
    this.tempBatDelList = [];
    this.headerRef = React.createRef();
    this.state = {
      videoHistories: [],
      liveHistories: [],
      searchKey: "",
      searchList: { video: [], live: [] },
      searchResult: { video: [], live: [] },
      searching: false,
      searched: false,
      noVideoHistory: false,
      noLiveHistory: false,
      tabInx: 0,
      mulDeleting: false,
      batchDelList: []
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
          tempSearchRes.video.push(record); // 不能直接在searchResult上改，否则setState无法触发重渲染
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
        const { searchList } = this.state;
        const { video, live } = tempSearchRes;
        videoMap.size !== 0 && (searchList.video = video);
        liveMap.size !== 0 && (searchList.live = live);
        this.setState({ searchList });
      }
    });
  }


  private handleMulDel = async () => {
    const { tabInx, batchDelList } = this.state;
    let hasProblem = false;

    await batchDelList.forEach(record => {
      if (hasProblem) { return }
      const { history, kid, selected } = record;
      selected && deleteHistory(tabInx === 0 ? `archive_${history.oid}` : `live_${kid}`)
        .then(result => {
          const { code, data } = result;
          if (code === "0") {
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
    });

    !hasProblem && Toast.success("删除成功！", false, null, 2000);
    setTimeout(() => {
      this.setHistoryData();
      this.setState({ mulDeleting: false });
    }, 2000);
  }

  private setKeyword = (keyword: string) => this.setState({ searchKey: keyword, searched: true });

  private getSearchRes = () => {
    const { searchList, searchKey } = this.state;
    const tempSearchRes = { video: [], live: [] };
    const findAndHightlight = list =>
      list.filter(record => {
        const { title } = record;
        const index = title.indexOf(searchKey);
        if (index !== -1) {
          const front: string = title.slice(0, index);
          const back = title.slice(index + searchKey.length);
          record.title = front + "<em class='keyword'>" + searchKey + "</em>" + back;
          return record;
        }
      });

    // 不能直接在searchResult上改，否则setState无法触发重渲染
    tempSearchRes.video = findAndHightlight(searchList.video);
    tempSearchRes.live = findAndHightlight(searchList.live);
    this.setState({ searchResult: tempSearchRes });
  }

  public componentDidMount() {
    this.setHistoryData();
  }

  public componentDidUpdate(prevProps, prevState) {
    const { searchKey, searching, searched } = this.state;
    searchKey !== prevState.searchKey && searchKey.length > 0 && this.getSearchRes()
    !searching! && searched && this.setState({ searched: false });
  }

  public render() {
    const { history } = this.props;
    const { mulDeleting, noVideoHistory, videoHistories, noLiveHistory, liveHistories,
      tabInx, searching, searchResult, searched, searchKey, batchDelList } = this.state;
    const headerComponent = this.headerRef.current;
    let counht = 0;

    const videoList = (
      <div className={style.videoHistory}>
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
            videoHistories.map((item, i) => (
              <ul className={style.viewedTimeGroup} key={`video${i}`}>
                {/* item[0]是map的键，item[1]是值 */}
                <div className={style.groupTitle}>{item[0]}</div>
                {item[1].map((record, j) => {
                  record.selected = false;
                  this.tempBatDelList.length < ++counht && this.tempBatDelList.push(record);
                  const curInx = counht - 1;

                  return (
                    <li className={style.itemWrapper} key={j}>
                      <VideoItem history={history} curFatherInx={tabInx} record={record}
                        mulDeleting={mulDeleting}
                        selected={batchDelList[curInx]?.selected}
                        switchSelected={() => {
                          const temp = [...this.tempBatDelList];
                          temp[curInx].selected = !temp[curInx].selected;
                          this.setState({ batchDelList: temp });
                          headerComponent.checkAllSelectedStatus();
                        }}
                      />
                    </li>
                  )
                })
                }
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
          searching && searched ?
            <ul className={style.searchResult}>
              <li className={style.total}>{`共找到关于“${searchKey}”的${searchResult.live.length}个内容`}</li>
              {searchResult.live.map((record, i) =>
                <li className={style.itemWrapper} key={i}>
                  <VideoItem history={history} curFatherInx={tabInx} record={record} />
                </li>
              )}
            </ul> :
            liveHistories.map((item, i) => (
              <ul className={style.viewedTimeGroup} key={`live${i}`}>
                <div className={style.groupTitle}>{item[0]}</div>
                {item[1].map((record, j) => {
                  return (<li className={style.itemWrapper} key={j}>
                    <VideoItem history={history} curFatherInx={tabInx} record={record}
                      switchSelected={() => {
                        record.selected = !record.selected;
                        this.setState({ liveHistories: this.state.liveHistories });
                        // this.checkAllSelectedStatus(1);
                      }}
                      mulDeleting={mulDeleting} />
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
        <HeaderWithTools ref={this.headerRef} title={"历史记录"} mode={2}
          setKeyword={this.setKeyword} searching={searching}
          setSerching={(bool: boolean) => this.setState({ searching: bool })}

          mulDeleting={mulDeleting} batchDelList={this.tempBatDelList} handleMulDel={this.handleMulDel}
          setBatchDelList={() => this.setState({ batchDelList: this.tempBatDelList })}
          setMulDeleting={status => this.setState({ mulDeleting: status })}
        />
        <TabBar tabTitle={["视频", "直播"]} setFatherCurInx={inx => this.setState({ tabInx: inx })}
          curFatherInx={tabInx} doSthWithNewInx={() => this.setState({ mulDeleting: false })}
        />
        <div className={style.listWrapper}>{tabInx === 0 ? videoList : liveList}</div>
        <ScrollToTop />
      </div>
    );
  }
}


export default MyHistory;