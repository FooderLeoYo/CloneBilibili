import * as React from "react";
import { History } from "history";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { getViewedHistory, clearHistory } from "../../../../../../api/space";
import { formatDate } from "../../../../../../customed-methods/datetime";
import { getPicSuffix } from "../../../../../../customed-methods/image";
import Context from "../../../../../../context";

import { Switcher } from "../../../../../../components/switcher/Switcher";
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
}

class MyHistory extends React.Component<MyHistoryProps, MyHistoryState> {
  /* 以下为初始化 */
  private historyRef: React.RefObject<HTMLDivElement>;
  private switcherRef: React.RefObject<HTMLDivElement>;
  private bottomPos: number;

  constructor(props) {
    super(props);
    this.historyRef = React.createRef();
    this.switcherRef = React.createRef();
    this.state = {
      videoHistories: [],
      liveHistories: [],
      noVideoHistory: false,
      noLiveHistory: false,
      tabInx: 0
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

  private getTime(timestamp) {
    const currentTime = new Date();
    const dateTime = new Date(timestamp * 1000);

    if (currentTime.getFullYear() === dateTime.getFullYear() &&
      currentTime.getMonth() === dateTime.getMonth()) {
      const diffDate = currentTime.getDate() - dateTime.getDate();
      switch (diffDate) {
        case 0:
          return "今天 " + formatDate(dateTime, "hh:mm");
        case 1:
          return "昨天 " + formatDate(dateTime, "hh:mm");
        case 2:
          return "前天 " + formatDate(dateTime, "hh:mm");
        default:
          return formatDate(dateTime, "yyyy-MM-dd hh:mm");
      }
    } else {
      return formatDate(dateTime, "yyyy-MM-dd hh:mm");
    }
  }

  // 这里如果不用用箭头函数，onClick={this.clearHistory}会报错setState undefined
  // 因为click事件触发后，调用绑定方法clearHistory的是window(未指定调用者时，this默认为全局对象)
  // 而window上是不带setState的
  // 而箭头函数的this在定义时就绑定而不是函数被调用时才指定
  // 即this.setState的this永远都是History组件
  // 当然也可以在绑定onClick时使用bind方法指定this
  private clearHistory = (type: string) => {
    clearHistory();
    // 光改noHistory不会触发重渲染，一定要将histories清空
    // 因为更改noHistory后虽然会执行render，但render会与比对渲染数据
    // 如果没清空histories，那么渲染数据没变，则不会触发重渲染
    if (type === "video") {
      this.setState({ noVideoHistory: true });
      this.setState({ videoHistories: [] });
    } else {
      this.setState({ noLiveHistory: true });
      this.setState({ liveHistories: [] });
    }
  }

  private getPicUrl(url, format) {
    const { picURL } = this.context;
    let suffix = ".webp";
    suffix = getPicSuffix();
    return `${picURL}?pic=${url}${format + suffix}`;
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

      const navDOM: any = this.historyRef.current.parentElement.firstElementChild
      this.bottomPos = this.switcherRef.current.offsetTop - navDOM.offsetHeight;
    });
  }

  public componentDidMount() {
    this.setHistoryData();
  }

  public render() {
    const sliderData = [
      <div className={style.videoHistory} key={"videoHistory"}>
        {
          !this.state.noVideoHistory ?
            this.state.videoHistories.map((item, i) => (
              <div className={style.historyItem} key={i}>
                {/* item[0]是map的键，item[1]是值 */}
                <div className={style.itemTitle}>{item[0]}</div>
                {
                  item[1].map((record, i) => {
                    const { history, cover, title, progress, duration, view_at, author_mid, author_name, } = record;
                    const { oid, dt } = history;
                    const curProgress = progress === -1 ? 100 : progress / duration * 100;
                    const platform = dt === 2 ? "pc" : dt === 4 || dt === 6 ? "pad" : "mobile";
                    return (
                      <div className={style.itemWrapper} key={i}>
                        <Link to={"/video/av" + oid}>
                          <div className={style.imgContainer}>
                            <span className={style.placeholder}>
                              <svg className="icon" aria-hidden="true">
                                <use href="#icon-placeholder"></use>
                              </svg>
                            </span>
                            <img src={this.getPicUrl(cover, "@320w_200h")} />
                            <div className={style.progressWrapper}>
                              <div className={style.curProgress} style={{ width: `${curProgress}%` }}></div>
                            </div>
                          </div>
                          <div className={style.info}>
                            <div className={style.title}>{title}</div>
                            <div
                              className={style.ownerWrapper}
                              onClick={e => {
                                e.preventDefault();
                                this.props.history.push({ pathname: "/space/" + author_mid });
                              }}
                            >
                              <span className={style.iconUp} >
                                <svg className="icon" aria-hidden="true">
                                  <use href="#icon-uper"></use>
                                </svg>
                              </span>
                              <span className={style.owner}>{author_name}</span>
                            </div>
                            <div className={style.time}>
                              <span className={style.platform}>
                                <svg className="icon" aria-hidden="true">
                                  <use href={`#icon-${platform}`}></use>
                                </svg>
                              </span>
                              {this.getTime(view_at)}
                            </div>
                          </div>
                        </Link>
                      </div>
                    )
                  })
                }
              </div>
            )) :
            <div className={style.tips}>
              <img src={tips} />
              <div className={style.text}>你还没有视频观看历史记录</div>
              <div className={style.text}>快去发现&nbsp;<Link to="/index">新内容</Link>&nbsp;吧！</div>
            </div>
        }
      </div>,
      <div className={style.liveHistory} key={"liveHistory"}>
        {
          !this.state.noLiveHistory ?
            this.state.liveHistories.map((item, i) => (
              <div className={style.historyItem} key={i}>
                <div className={style.itemTitle}>{item[0]}</div>
                {
                  item[1].map((record, i) => {
                    const { history, kid, cover, title, view_at, author_mid, author_name, badge } = record;
                    const { dt } = history;
                    const platform = dt === 2 ? "pc" : dt === 4 || dt === 6 ? "pad" : "phone";
                    const liveStatus = badge === "未开播" ? "offline" : "live";
                    return (
                      <div className={style.itemWrapper} key={i}>
                        <Link to={"/live/" + kid}>
                          <div className={style.imgContainer}>
                            <span className={style.placeholder}>
                              <svg className="icon" aria-hidden="true">
                                <use href="#icon-placeholder"></use>
                              </svg>
                            </span>
                            <img src={this.getPicUrl(cover, "@320w_200h")} />
                          </div>
                          <div className={style.info}>
                            <div className={style.title}>{title}</div>
                            <div
                              className={style.streamerWrapper}
                              onClick={e => {
                                e.preventDefault();
                                this.props.history.push({ pathname: "/space/" + author_mid });
                              }}
                            >
                              <span className={style.iconUp} >
                                <svg className="icon" aria-hidden="true">
                                  <use href="#icon-uper"></use>
                                </svg>
                              </span>
                              <span className={style.owner}>{author_name}</span>
                              <span className={style.liveStatus + " " + style[liveStatus]}>{badge}</span>
                            </div>
                            <div className={style.time}>
                              <span className={style.platform}>
                                <svg className="icon" aria-hidden="true">
                                  <use href={`#icon-${platform}`}></use>
                                </svg>
                              </span>
                              {this.getTime(view_at)}
                            </div>
                          </div>
                        </Link>
                      </div>
                    )
                  })
                }
              </div>
            )) :
            <div className={style.tips}>
              <img src={tips} />
              <div className={style.text}>你还没有视频观看历史记录</div>
              <div className={style.text}>快去发现&nbsp;<Link to="/live">新直播</Link>&nbsp;吧！</div>
            </div>
        }
      </div>
    ];
    const showClear = (this.state.tabInx === 0 && !this.state.noVideoHistory) ||
      (this.state.tabInx === 1 && !this.state.noLiveHistory);

    return (
      <div className={style.myHistory} ref={this.historyRef} >
        <Helmet><title>历史记录</title></Helmet>
        <div className={style.switcherArea} ref={this.switcherRef}>
          < Switcher
            tabTitle={["视频", "直播"]}
            sliderData={sliderData}
            switchRatio={0.15}
            scrollToAtFirstSwitch={this.bottomPos}
            doSthWithNewInx={tabInx => this.setState({ tabInx })}
          />
        </div>
        <ScrollToTop />
        {
          showClear ?
            <div
              className={style.clearHistory}
              onClick={() => this.clearHistory(this.state.tabInx === 0 ? "video" : "live")}
            >
              <svg className="icon" aria-hidden="true">
                <use href="#icon-clean"></use>
              </svg>
            </div> : null
        }
      </div>
    );
  }
}

MyHistory.contextType = Context;

export default MyHistory;