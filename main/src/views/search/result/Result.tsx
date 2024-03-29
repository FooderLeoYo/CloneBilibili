import * as React from "react";
import LazyLoad from "react-lazyload";

import ScrollToTop from "@components/scroll-to-top/ScrollToTop";

import { getSearchResult } from "@api/search";
import Context from "@context/index";
import { Video, UpUser, createVideoBySearch } from "@class-object-creators/index";
import { getPicSuffix } from "@customed-methods/image";

import VideoItemLandscape from "@components/video-item-landscape/VideoItemLandscape";
import tips from "@assets/images/tips.png";

import style from "./result.styl?css-modules";

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
    getSearchResult(this.props.keyword, this.page.pageNumber, this.page.pageSize,
      this.searchType, this.orderType).then(result => {
        if (result.code === "1") {
          let videos = [];
          let upUsers = [];
          let upUserCount = this.state.upUserCount;
          if (this.searchType === SearchType.ALL) {  // 综合
            videos = result.data.result.map(item => createVideoBySearch(item));
          } else {  // up主
            upUsers = result.data.result.map(item => ({
              videoCount: item.videos,
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
      this.page.pageNumber <= 5 && this.getResult();
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
    if (url.indexOf(".gif") !== -1) { return `${picURL}?pic=${url}` }
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  public componentDidMount() {
    this.getResult();
    window.addEventListener("scroll", this.handleScroll);
  }

  public componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  public render() {
    return (
      <div className={style.resultContainer} ref={this.resultRef}>
        {/* tab栏 */}
        <div className={style.tabContainer}>
          <div className={style.tabItem}>
            <div className={style.item + (this.searchType === SearchType.ALL ? " " + style.current : "")}
              onClick={() => { this.changeSearchType(SearchType.ALL) }}
            >综合
            </div>
          </div>
          <div className={style.tabItem}>
            <div className={style.item + (this.searchType === SearchType.UPUSER ? " " + style.current : "")}
              onClick={() => { this.changeSearchType(SearchType.UPUSER) }}
            >UP主
              {this.state.upUserCount > 0 ? this.state.upUserCount > 100 ?
                "(99+)" : `(${this.state.upUserCount})` : ""
              }
            </div>
          </div>
        </div>
        {this.searchType === SearchType.ALL ? (
          <div className={style.resultWrapper}>
            {/* 排序方式tabs */}
            <div className={style.subTab}>
              <div className={style.sort + (this.orderType === OrderType.TOTALRANK ? " " + style.current : "")}
                onClick={() => { this.changeOrderType(OrderType.TOTALRANK) }}
              >默认排序
              </div>
              <div className={style.sort + (this.orderType === OrderType.CLICK ? " " + style.current : "")}
                onClick={() => { this.changeOrderType(OrderType.CLICK) }}
              >播放多
              </div>
              <div className={style.sort + (this.orderType === OrderType.PUBDATA ? " " + style.current : "")}
                onClick={() => { this.changeOrderType(OrderType.PUBDATA) }}
              >新发布
              </div>
              <div className={style.sort + (this.orderType === OrderType.DM ? " " + style.current : "")}
                onClick={() => { this.changeOrderType(OrderType.DM) }}
              >弹幕多
              </div>
            </div>
            {/* 视频列表 */}
            <div className={style.videoList}>
              {this.state.videos.map((video, i) => (
                <div className={style.videoWrapper} key={video.aId + i + ""}>
                  <VideoItemLandscape videoData={video}
                    imgParams={{
                      imgHeight: "3.654rem",
                      imgSrc: "https:" + video.pic,
                      imgFormat: "@200w_125h"
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : ( // up主列表
          <div className={style.upUserList}>
            {this.state.upUsers.map(user => (
              <div className={style.upUserWrapper} key={user.mId}>
                <a href={"/space/" + user.mId}>
                  <div className={style.face}>
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-placeholder"></use>
                    </svg>
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
            ))}
          </div>
        )}
        { // 加载中
          this.state.loading === true && <div className={style.loading}>(´・ω・｀)正在加载...</div>
        }
        { // 加载到底
          this.page.pageNumber >= 5 &&
          <div className={style.tips}>
            <img src={tips} />
            <span className={style.text}>刷到底了哟，从头再来吧 ~</span>
          </div>
        }
        <ScrollToTop />
      </div>
    );
  }
}

Result.contextType = Context;

export default Result;
