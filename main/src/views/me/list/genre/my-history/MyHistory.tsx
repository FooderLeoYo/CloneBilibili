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
  searchResult: [[string, []][], [string, []][]];
  searching: boolean;
  searched: boolean;
  noVideoHistory: boolean;
  noLiveHistory: boolean;
  tabInx: number;
  mulDeleting: boolean;
  batchDelList: Array<any>;
  searchResCount: Array<number>;
}

class MyHistory extends React.Component<MyHistoryProps, MyHistoryState> {
  private headerRef: React.MutableRefObject<any>;
  constructor(props) {
    super(props);
    this.headerRef = React.createRef();
    this.state = {
      videoHistories: [],
      liveHistories: [],
      searchKey: "",
      searchResult: [[], []],
      searching: false,
      searched: false,
      noVideoHistory: false,
      noLiveHistory: false,
      tabInx: 0,
      mulDeleting: false,
      batchDelList: [],
      searchResCount: [0, 0]
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
        } else if (history.business === "live") {
          updateMap(liveMap, view_at, record);
        }
      });

      if (videoMap.size === 0) { this.setState({ noVideoHistory: true }) }
      else { this.setState({ videoHistories: [...videoMap] }); }
      if (liveMap.size === 0) { this.setState({ noLiveHistory: true }) }
      else { this.setState({ liveHistories: [...liveMap] }); }
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

  private accessTarKey = (data, findAndHightlight) => {
    let tempCount = [], inx = 0;
    const tempAll = data.map(category => {
      let tempCategory = [], count = 0;
      category.forEach(group => {
        const searchRes = findAndHightlight(group[1], "title");
        const len = searchRes.length;
        if (len > 0) {
          const tempMap: Map<string, []> = new Map();
          tempMap.set(group[0], searchRes);
          tempCategory = tempCategory.concat([...tempMap]);
          count += len;
        }
      });
      tempCount[inx++] = count;
      return tempCategory;
    });
    this.setState({ searchResCount: tempCount })
    return tempAll;
  }

  public componentDidMount() {
    this.setHistoryData();
  }

  public render() {
    const { history } = this.props;
    const { mulDeleting, noVideoHistory, videoHistories, noLiveHistory, liveHistories,
      tabInx, searching, searchResult, searched, searchKey, batchDelList } = this.state;
    const headerComponent = this.headerRef.current;
    const tempBatDelList = [];

    const videoList = (
      <div className={style.videoHistory}>
        {!noVideoHistory ?
          searching && searched ?
            <ul className={style.searchResult}>
              <li className={style.total}>{`共找到关于“${searchKey}”的${this.state.searchResCount[0]}个内容`}</li>
              {searchResult[0].map((item, i) =>
                <ul className={style.viewedTimeGroup} key={`video${i}`}>
                  <div className={style.groupTitle}>{item[0]}</div>
                  {item[1]?.map((record, j) =>
                    <li className={style.itemWrapper} key={j}>
                      <VideoItem history={history} curFatherInx={tabInx} record={record} />
                    </li>
                  )}
                </ul>
              )}
            </ul> :
            videoHistories.map((item, i) => (
              <ul className={style.viewedTimeGroup} key={`video${i}`}>
                {/* item[0]是map的键，item[1]是值 */}
                <div className={style.groupTitle}>{item[0]}</div>
                {item[1].map((record, j) => {
                  tempBatDelList.push(record);
                  const batDelItemInx = tempBatDelList.length - 1;
                  return (
                    <li className={style.itemWrapper} key={j}>
                      <VideoItem history={history} curFatherInx={tabInx} record={record}
                        mulDeleting={mulDeleting}
                        batchDelList={batchDelList} batDelItemInx={batDelItemInx} header={headerComponent}
                        setBatchDelList={list => this.setState({ batchDelList: list })}
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
          searching && searched ?
            <ul className={style.searchResult}>
              <li className={style.total}>{`共找到关于“${searchKey}”的${this.state.searchResCount[1]}个内容`}</li>
              {searchResult[1].map((item, i) =>
                <ul className={style.viewedTimeGroup} key={`video${i}`}>
                  <div className={style.groupTitle}>{item[0]}</div>
                  {item[1]?.map((record, j) =>
                    <li className={style.itemWrapper} key={j}>
                      <VideoItem history={history} curFatherInx={tabInx} record={record} />
                    </li>
                  )}
                </ul>
              )}
            </ul> :
            liveHistories.map((item, i) => (
              <ul className={style.viewedTimeGroup} key={`live${i}`}>
                <div className={style.groupTitle}>{item[0]}</div>
                {item[1].map((record, j) => {
                  tempBatDelList.push(record);
                  const batDelItemInx = (i + 1) * (j + 1);
                  return (<li className={style.itemWrapper} key={j}>
                    <VideoItem history={history} curFatherInx={tabInx} record={record}
                      mulDeleting={mulDeleting}
                      batchDelList={batchDelList} batDelItemInx={batDelItemInx} header={headerComponent}
                      setBatchDelList={list => this.setState({ batchDelList: list })}
                    />
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
          // 搜索相关
          searching={searching} accessTarKey={this.accessTarKey} searchKey={searchKey}
          setSearching={(bool: boolean) => this.setState({ searching: bool })}
          setSearched={(bool: boolean) => this.setState({ searched: bool })}
          setSearchKey={(key: string) => this.setState({ searchKey: key })}
          dataForSearch={[videoHistories, liveHistories]}
          setSearchResult={(arr: [[], []]) => this.setState({ searchResult: arr })}
          // 批量删除相关
          tempBatDelList={tempBatDelList} batchDelList={batchDelList}
          mulDeleting={mulDeleting} handleMulDel={this.handleMulDel}
          setBatchDelList={list => this.setState({ batchDelList: list })}
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