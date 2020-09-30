import * as React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";

import storage, { ViewHistory } from "../../customed-methods/storage";

import { formatDate } from "../../customed-methods/datetime";
import style from "./stylus/history.styl?css-modules";
import tips from "../../assets/images/nocontent.png";
import clearIcon from "../../assets/images/clear-history.svg"

interface HistoryState {
  itemIndex: number;
  histories: Array<[string, ViewHistory[]]>;
  noHistory: boolean;
}

class History extends React.Component<null, HistoryState> {
  /* 以下为初始化 */
  constructor(props) {
    super(props);
    this.state = {
      itemIndex: 0,
      histories: [],
      noHistory: false
    }
  }

  /* 以下为自定义方法 */
  private getDateKey(timestamp) {
    const currentTime = new Date();
    const dateTime = new Date(timestamp);

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
    const dateTime = new Date(timestamp);

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
  private clearHistory = () => {
    if (!this.state.noHistory) {
      storage.clearViewHistory();
      // 光改noHistory不会触发重渲染，一定要将histories清空
      // 因为更改noHistory后虽然会执行render，但render会与比对渲染数据
      // 如果没清空histories，那么渲染数据没变，则不会触发重渲染
      this.setState({ histories: [] });
      this.setState({ noHistory: true });
    }
  }

  /* 以下为生命周期 */
  public componentDidMount() {
    const viewHistories = storage.getViewHistory();

    if (viewHistories.length === 0) {
      this.setState({ noHistory: true });
    } else {
      // 按点击时间降序
      // sort(a, b)：如果返回值大于0，则排序后b在a之前
      viewHistories.sort((a, b) => b.viewAt - a.viewAt);

      // 按时间点（今天，昨天，更早）分组
      const historyMap: Map<string, ViewHistory[]> = new Map();
      // 将viewHistories中的history分类，每一种DateKey的history放进一个数组中
      // 然后按照键是DateKey、值是DateKey对应的数组，放进historyMap中
      viewHistories.forEach(history => {
        const key = this.getDateKey(history.viewAt);
        let temHistory = historyMap.get(key);

        if (temHistory) {
          temHistory.push(history);
        } else {
          temHistory = new Array();
          temHistory.push(history);
          historyMap.set(key, temHistory);
        }
      });

      this.setState({ histories: [...historyMap] });
    }
  }

  /* 以下为渲染部分 */
  public render() {
    return (
      <div className="history">
        <Helmet>
          <title>个人空间</title>
        </Helmet>
        {/* tabbar */}
        <div className={style.tabWrapper}>
          <div
            className={style.tabItem + (this.state.itemIndex === 0 ? " " + style.current : "")}
            onClick={() => { this.setState({ itemIndex: 0 }) }}
          >
            <span>历史记录</span>
          </div>
          <div
            className={style.tabItem + (this.state.itemIndex === 1 ? " " + style.current : "")}
            onClick={() => { this.setState({ itemIndex: 1 }) }}
          >
            <span>我的投稿</span>
          </div>
        </div>
        {/* 播放历史记录 */}
        <div
          className={style.history}
          style={{ display: this.state.itemIndex === 0 ? "block" : "none" }}
        >
          {
            this.state.histories.map((item, i) => (
              <div className={style.historyItem} key={i}>
                {/* item[0]是map的键，item[1]是值 */}
                <div className={style.itemTitle}>{item[0]}</div>
                {
                  item[1].map(history => (
                    <div className={style.itemWrapper} key={history.aId}>
                      <Link to={"/video/av" + history.aId}>
                        <div className={style.imgContainer}>
                          <img src={history.pic} />
                        </div>
                        <div className={style.info}>
                          <div className={style.title}>{history.title}</div>
                          <div className={style.time}>
                            {this.getTime(history.viewAt)}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))
                }
              </div>
            ))
          }
          { // 无播放记录时
            this.state.histories.length === 0 ? (
              <div className={style.tips}>
                <img src={tips} />
                <div className={style.text}>你还没有历史记录</div>
                <div className={style.text}>快去发现&nbsp;<Link to="/index">新内容</Link>&nbsp;吧！</div>
              </div>
            ) : (
                <div className={style.clearHistory} onClick={this.clearHistory}>
                  {/* <span>清空历史记录！！！！！！！！</span> */}
                  <img src={clearIcon} alt="clearHistory" />
                </div>
              )
          }
        </div>
        {/* 我的投稿 */}
        <div style={{ display: this.state.itemIndex === 1 ? "block" : "none" }}>
          <div className={style.tips}>
            <img src={tips} />
            <div className={style.text}>小哔睡着了~</div>
          </div>
        </div>
        <ScrollToTop />
      </div>
    );
  }
}

export default History;
