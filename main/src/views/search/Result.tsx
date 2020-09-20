import * as React from "react";
import LazyLoad from "react-lazyload";

import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";

import { getSearchResult } from "../../api/search";
import Context from "../../context";

import { Video, UpUser, createVideoBySearch } from "../../class-object-creators";
import { formatTenThousand, formatDuration } from "../../customed-methods/string";
import { getPicSuffix } from "../../customed-methods/image";

import tips from "../../assets/images/tips.png";
import style from "./stylus/result.styl?css-modules";

interface ResultProps {
  keyword: string;
  staticContext?: { picSuffix: string };
}

interface ResultState {
  loading: boolean;
  videos: Video[];
  upUsers: any[];
  upUserCount: number;
}

// 排序方式
enum OrderType {
  TOTALRANK = "totalrank", // 默认
  CLICK = "click", // 播放数
  PUBDATA = "pubdate", // 发布日期
  DM = "dm" // 弹幕
}

enum SearchType {
  ALL = "video", // 综合
  UPUSER = "bili_user" // up主
}

class Result extends React.Component<ResultProps, ResultState> {
  /* 以下为初始化 */
  private resultRef: React.RefObject<HTMLDivElement>;
  private orderType: OrderType = OrderType.TOTALRANK; // 排序方式
  private searchType: SearchType = SearchType.ALL; // 搜索结果类型
  private page: { pageNumber: number, pageSize: number } = {
    pageNumber: 1,
    pageSize: 20
  };
  constructor(props) {
    super(props);
    this.resultRef = React.createRef();
    this.state = {
      loading: true,
      videos: [],
      upUsers: [],
      upUserCount: 0
    }
  }

  /* 以下为自定义方法 */
  private getResult() {
    getSearchResult({
      keyword: this.props.keyword,
      page: this.page.pageNumber,
      size: this.page.pageSize,
      searchType: this.searchType,
      order: this.orderType,
    }).then(result => {
      if (result.code === "1") {
        let videos = [];
        let upUsers = [];
        let upUserCount = this.state.upUserCount;
        if (this.searchType === SearchType.ALL) {  // 综合
          videos = result.data.result.map(item => createVideoBySearch(item));
        } else {  // up主
          upUsers = result.data.result.map(item => ({
            videoCount: item.videos,
            // 扩展运算符的展开语法，这里的作用是将UpUser的元素取出并拼接到videoCount之后
            ...new UpUser(
              item.mid,
              item.uname,
              item.upic,
              item.level,
              "",
              item.usign,
              0,
              item.fans
            )
          }));
          upUserCount = result.data.numResults
        }

        this.setState({
          loading: false,
          videos: this.state.videos.concat(videos),
          upUsers: this.state.upUsers.concat(upUsers),
          upUserCount
        })
      }
    })
  }

  private handleScroll = () => {
    const resultDOM = this.resultRef.current;
    // 这里使用documentElement || body是为了照顾不同的浏览器
    const scrollDistance = document.documentElement.scrollTop || document.body.scrollTop;
    const viewHeight = window.innerHeight;
    const contentHeight = resultDOM.offsetHeight;
    // 如果滚动到底部，则加载下一页数据
    if (scrollDistance >= contentHeight - viewHeight) {
      this.page.pageNumber += 1;
      // 最大加载5页
      if (this.page.pageNumber <= 5) {
        this.getResult();
      }
    }
  }

  private changeSearchType(searchType: SearchType) {
    if (this.searchType !== searchType) {
      this.searchType = searchType;
      this.page.pageNumber = 1;
      this.setState({
        loading: true,
        videos: [],
        upUsers: []
      });
      this.getResult();
    }
  }

  private changeOrderType(orderType: OrderType) {
    if (this.orderType !== orderType) {
      this.orderType = orderType;
      this.page.pageNumber = 1;
      this.setState({
        loading: true,
        videos: []
      });
      this.getResult();
    }
  }

  private getPicUrl(url, format) {
    const { picURL } = this.context;
    const suffix = getPicSuffix();
    // 默认头像
    if (url.indexOf(".gif") !== -1) {
      return `${picURL}?pic=${url}`;
    }
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  /* 以下为生命周期函数 */
  public componentDidMount() {
    this.getResult();
    window.addEventListener("scroll", this.handleScroll);
  }

  public componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  /* 以下为渲染部分 */
  public render() {
    return (
      <div className={style.resultContainer} ref={this.resultRef}>
        {/* tab栏 */}
        <div className={style.tabContainer}>
          <div className={style.tabItem}>
            <div
              className={style.item + (this.searchType === SearchType.ALL ? " " + style.current : "")}
              onClick={() => { this.changeSearchType(SearchType.ALL) }}
            >综合</div>
          </div>
          <div className={style.tabItem}>
            <div
              className={style.item + (this.searchType === SearchType.UPUSER ? " " + style.current : "")}
              onClick={() => { this.changeSearchType(SearchType.UPUSER) }}
            >UP主{
                this.state.upUserCount > 0 ? (
                  this.state.upUserCount > 100 ?
                    "(99+)" : `(${this.state.upUserCount})`
                ) : ""
              }
            </div>
          </div>
        </div>
        {
          this.searchType === SearchType.ALL ? (
            <div className={style.resultWrapper}>
              {/* 排序方式tabs */}
              <div className={style.subTab}>
                <div
                  className={style.sort + (this.orderType === OrderType.TOTALRANK ? " " + style.current : "")}
                  onClick={() => { this.changeOrderType(OrderType.TOTALRANK) }}
                >默认排序
                </div>
                <div
                  className={style.sort + (this.orderType === OrderType.CLICK ? " " + style.current : "")}
                  onClick={() => { this.changeOrderType(OrderType.CLICK) }}
                >播放多
                </div>
                <div
                  className={style.sort + (this.orderType === OrderType.PUBDATA ? " " + style.current : "")}
                  onClick={() => { this.changeOrderType(OrderType.PUBDATA) }}
                >新发布
                </div>
                <div
                  className={style.sort + (this.orderType === OrderType.DM ? " " + style.current : "")}
                  onClick={() => { this.changeOrderType(OrderType.DM) }}
                >弹幕多
                </div>
              </div>
              {/* 视频列表 */}
              <div className={style.videoList}>
                {
                  this.state.videos.map((video, i) => (
                    <div className={style.videoWrapper} key={video.aId + i + ""}>
                      {/* 这里的href为相对url，因此不需要写完整的 */}
                      <a href={"/video/av" + video.aId}>
                        <div className={style.imageContainer}>
                          <LazyLoad height={"3.654rem"}>
                            <img src={this.getPicUrl("https:" + video.pic, "@200w_125h")} alt={video.title} />
                          </LazyLoad>
                          <div className={style.duration}>
                            {formatDuration(video.duration, "0#:##:##")}
                          </div>
                        </div>
                        <div className={style.infoWrapper}>
                          <p dangerouslySetInnerHTML={{ __html: video.title }} />
                          <div className={style.ownerWrapper}>
                            <span className={style.iconUp} />
                            <span className={style.owner}>{video.owner.name}</span>
                          </div>
                          <div className={style.countInfo}>
                            <span className={style.iconPlay} />
                            <span className={style.playCount}>
                              {formatTenThousand(video.playCount)}
                            </span>
                            <span className={style.iconBarrage} />
                            <span className={style.barrageCount}>
                              {formatTenThousand(video.barrageCount)}
                            </span>
                          </div>
                        </div>
                      </a>
                    </div>
                  ))
                }
              </div>
            </div>
          ) : ( // up主列表
              <div className={style.upUserList}>
                {
                  this.state.upUsers.map(user => (
                    <div className={style.upUserWrapper} key={user.mId}>
                      <a href={"/space/" + user.mId}>
                        <div className={style.face}>
                          <LazyLoad height={"3rem"}>
                            <img src={this.getPicUrl("https:" + user.face, "@120w_120h")} alt={user.name} />
                          </LazyLoad>
                        </div>
                        <div className={style.upInfo}>
                          <div className={style.name}>{user.name}</div>
                          <div className={style.detail}>
                            <span>粉丝：{user.follower}</span>
                            <span>视频：{user.videoCount}</span>
                          </div>
                          <div className={style.sign}>{user.sign}</div>
                        </div>
                      </a>
                    </div>
                  ))
                }
              </div>
            )
        }
        { // 加载中
          this.state.loading === true ? (
            <div className={style.loading}>
              (´・ω・｀)正在加载...
            </div>
          ) : null
        }
        { // 加载到底
          this.page.pageNumber >= 5 ? (
            <div className={style.tips}>
              <img src={tips} />
              <span className={style.text}>刷到底了哟，从头再来吧 ~</span>
            </div>
          ) : null
        }
        <ScrollToTop />
      </div>
    );
  }
}

Result.contextType = Context;

export default Result;
