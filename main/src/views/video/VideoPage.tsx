import * as React from "react";
import { Link, match } from "react-router-dom";
import { Helmet } from "react-helmet";
import LazyLoad from "react-lazyload";
import { History } from "history";

import Context from "../../context";
import { getRecommendVides, getComments } from "../../api/video";
import storage from "../../customed-methods/storage";
import getVideoDetail from "../../redux/async-action-creators/video";
import { setShouldLoad } from "../../redux/action-creators";

import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";
import HeaderWithBack from "../../components/header-with-back/HederWithBack";
import LoadingCutscene from "../../components/loading-cutscene/LoadingCutscene";
import VideoPlayer from "../../components/player/Player";

import { Video, createVideo, UpUser } from "../../class-object-creators";
import { getPicSuffix } from "../../customed-methods/image";
import { formatDate } from "../../customed-methods/datetime";
import { formatTenThousand, formatDuration } from "../../customed-methods/string";

import style from "./stylus/video-page.styl?css-modules";

interface VideoPageProps {
  shouldLoad: boolean;
  dispatch: (action: any) => Promise<void>;
  video: Video;
  match: match<{ aId }>;
  history: History;
  staticContext?: { picSuffix: string };
}

interface VideoPageState {
  videoData: any;
  isDataOk: boolean,
  loading: boolean;
  recommendVides: Video[];
  showLoadMore: boolean;
  comments: any;
  isRecommend: boolean; // 必须设成state而不能是初始化时的一个private变量，否则变化不引发组件更新
  isSwitcherFixed: boolean;
  prevId: number;
}

class VideoPage extends React.Component<VideoPageProps, VideoPageState> {
  /* 以下为初始化 */
  private topWrapperRef: React.RefObject<HTMLDivElement>;
  private arrowRef: React.RefObject<HTMLDivElement>;
  private infoContainerRef: React.RefObject<HTMLDivElement>;
  private infoRef: React.RefObject<HTMLDivElement>;
  private switcherRef: React.RefObject<HTMLDivElement>;
  private bottomWrapperRef: React.RefObject<HTMLDivElement>;
  private commentAreaRef: React.RefObject<HTMLDivElement>;
  private recommendListRef: React.RefObject<HTMLDivElement>;

  private infoExpand: boolean;
  private commentPage: { pageNumber: number, pageSize: number, count: number };
  private bottomPos: number;
  constructor(props) {
    super(props);
    this.topWrapperRef = React.createRef();
    this.arrowRef = React.createRef();
    this.infoContainerRef = React.createRef();
    this.infoRef = React.createRef();
    this.switcherRef = React.createRef();
    this.bottomWrapperRef = React.createRef();
    this.commentAreaRef = React.createRef();
    this.recommendListRef = React.createRef();
    this.infoExpand = false;
    this.commentPage = {
      pageNumber: 1,
      pageSize: 20,
      count: 0
    };
    this.state = {
      videoData: {},
      isDataOk: false,
      loading: true,
      recommendVides: [],
      showLoadMore: true,
      comments: [],
      isRecommend: true,
      isSwitcherFixed: false,
      prevId: -999
    }
  }

  /* 以下为自定义方法 */
  private getPubdate(timestamp) {
    const publicDate = new Date(timestamp * 1000); // unix时间转换成本地时间戳
    let publicDateStr = "";
    const date = new Date();
    if (publicDate.getFullYear() === date.getFullYear()) {
      if (publicDate.getMonth() === date.getMonth()) {
        const diffDate = date.getDate() - publicDate.getDate();
        switch (diffDate) {
          case 0:
            if (date.getHours() - publicDate.getHours() === 0) {
              publicDateStr = date.getMinutes() - publicDate.getMinutes() + "分钟前";
            } else {
              publicDateStr = date.getHours() - publicDate.getHours() + "小时前";
            }
            break;
          case 1:
            publicDateStr = "昨天";
            break;
          case 2:
            publicDateStr = "前天";
            break;
          default:
            publicDateStr = publicDate.getMonth() + 1 + "-" + publicDate.getDate();
        }
      } else {
        publicDateStr = publicDate.getMonth() + 1 + "-" + publicDate.getDate();
      }
    } else {
      publicDateStr = publicDate.getFullYear() + "-" +
        (publicDate.getMonth() + 1) + "-" +
        publicDate.getDate();
    }
    return publicDateStr;
  }

  private getRecommentVideos() {
    getRecommendVides(this.props.match.params.aId)
      .then(result => {
        if (result.code === "1") {
          const recommendVides = result.data.map(item => createVideo(item));
          this.setState({
            loading: false,
            recommendVides
          });
        }
      });
  }

  private getComments() {
    getComments(this.props.match.params.aId, this.commentPage.pageNumber)
      .then((result) => {
        if (result.code === "1") {
          const page = result.data.page;
          // page.count：总评论数
          // page.size：每页显示评论数
          const maxPage = Math.ceil(page.count / page.size);
          const showLoadMore = this.commentPage.pageNumber < maxPage;
          // 保存当前页码、每页评论数、总评论数
          this.commentPage = {
            pageNumber: this.commentPage.pageNumber,
            pageSize: page.size,
            count: page.count
          }
          // 生成每一条评论并保存到this.state.comments中
          let comments = [];
          if (result.data.replies) {
            comments = result.data.replies.map((item) => {
              let date: any = new Date(item.ctime * 1000); // unix时间转换成本地时间戳
              date = formatDate(date, "yyyy-MM-dd hh:mm");
              return {
                content: item.content.message,
                date,
                user: { ...new UpUser(item.member.mid, item.member.uname, item.member.avatar) }
              }
            });
          }
          this.setState({
            showLoadMore,
            comments: this.state.comments.concat(comments)
          });
        }
      });
  }

  //  展开或隐藏全部信息
  private toggle = () => {
    const arrowDOM = this.arrowRef.current;
    const infoContainerDOM = this.infoContainerRef.current; // 显示出来的简介长度
    const infoDOM = this.infoRef.current; // 简介完整内容长度
    const titleDOM = infoDOM.getElementsByTagName("div")[0];
    if (!this.infoExpand) {
      titleDOM.style.whiteSpace = "normal"; // 若标题太长，收起时不完全显示
      infoContainerDOM.style.height = infoDOM.offsetHeight + "px";
      arrowDOM.classList.add(style.rotate);
      this.infoExpand = true;
    } else {
      titleDOM.style.whiteSpace = "nowrap"; // 下拉时显示完整标题
      infoContainerDOM.style.height = null;
      arrowDOM.classList.remove(style.rotate);
      this.infoExpand = false;
    }
  }

  // 根据手指滑动距离判断是否切换switcher
  private shouldSwitch = (fingerMoveDistanceX: number) => {
    const fingerMoveXAbs = Math.abs(fingerMoveDistanceX);
    const switchRatio = 0.25; // 手指拖动超过该比例才切换
    let targetIndex = this.state.isRecommend ? 2 : 1;
    const isNoContentSide = // 在推荐时手指往右或在评论时手指往左
      (targetIndex === 2 && fingerMoveDistanceX > 0) || (targetIndex === 1 && fingerMoveDistanceX < 0)
    if (fingerMoveXAbs === 0 || fingerMoveXAbs < switchRatio * outerWidth || isNoContentSide) {
      return
    } else {
      this.switchBottom(targetIndex);
    }
  }

  private loadMoreComment() {
    // 加载下一页评论
    this.commentPage.pageNumber += 1;
    this.getComments();
  }

  private getPicUrl(url, format) {
    const { picURL } = this.context;
    let suffix = ".webp";
    if (process.env.REACT_ENV === "server") {
      // 服务端获取图片后缀
      suffix = this.props.staticContext.picSuffix;
    } else {
      suffix = getPicSuffix();
    }
    // 默认头像
    if (url.indexOf(".gif") !== -1) {
      return `${picURL}?pic=${url}`;
    }
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  private toSpace(mId) {
    this.props.history.push({
      pathname: "/space/" + mId
    });
  }

  private switchBottom(indx: Number) {
    const bottomDOM = this.bottomWrapperRef.current;
    const recDOM = this.recommendListRef.current;
    const comDOM = this.commentAreaRef.current;
    switch (indx) {
      case 1:
        if (!this.state.isRecommend) {
          recDOM.classList.add(style.isCurrent);
          comDOM.classList.remove(style.isCurrent);
          window.scrollTo(0, this.bottomPos);
          bottomDOM.style.transform = `translateX(0)`;
          this.setState({ isRecommend: true });
        }
        break;
      case 2:
        if (this.state.isRecommend) {
          comDOM.classList.add(style.isCurrent);
          recDOM.classList.remove(style.isCurrent);
          window.scrollTo(0, this.bottomPos);
          bottomDOM.style.transform = `translateX(-100vw)`;
          this.setState({ isRecommend: false });
        }
        break;
      default:
        break;
    }
  }

  private setBottomListeners() {
    // 设置底部切换区域的位置，切换时都跳到这个位置
    const topWrapperDOM = this.topWrapperRef.current;
    const switcherDOM = this.switcherRef.current;
    this.bottomPos = switcherDOM.offsetTop - topWrapperDOM.offsetHeight;

    // 拖动底部区域切换推荐/评论
    const bottomDOM = this.bottomWrapperRef.current;
    let initX = 0;
    let fingerMoveDistanceX = 0;
    bottomDOM.addEventListener("touchstart", e => {
      e.stopPropagation();
      initX = e.touches[0].pageX;
    });
    bottomDOM.addEventListener("touchmove", e => {
      let curX = e.touches[0].pageX;
      fingerMoveDistanceX = curX - initX;
    });
    bottomDOM.addEventListener("touchend", () => {
      this.shouldSwitch(fingerMoveDistanceX);
    });
  }

  // 记录浏览历史信息
  private saveHistory(video) {
    storage.setViewHistory({
      aId: video.aId,
      title: video.title,
      pic: video.pic,
      viewAt: new Date().getTime()
    });
  }

  private setInitStatus() {
    this.setState({
      videoData: this.props.video,
      isDataOk: true
    });

    this.saveHistory(this.state.videoData);

    // 不放在定时器里会报错找不到相关Dom节点
    setTimeout(() => {
      this.setBottomListeners();
    }, 1);
  }

  /* 以下为生命周期函数 */
  public componentDidMount() {
    this.getRecommentVideos();
    this.getComments();

    if (this.props.shouldLoad) {
      this.props.dispatch(getVideoDetail(this.props.match.params.aId)).
        then(() => { this.setInitStatus(); });
    } else {
      this.setInitStatus();
      this.props.dispatch(setShouldLoad(true));
    }

    setTimeout(() => {
      this.recommendListRef.current.classList.add(style.isCurrent);
    }, 1000);
  }

  public componentDidUpdate() {
    const aId = this.props.match.params.aId;
    if (aId !== this.state.prevId) {
      this.setState({
        isDataOk: false,
        videoData: {},
        prevId: aId
      });

      this.getRecommentVideos();
      this.getComments();
      this.props.dispatch(getVideoDetail(aId))
        .then(() => { this.setInitStatus(); });
    }
  }

  /* 以下为渲染部分 */
  public render() {
    const video = this.state.videoData;
    const isDataOk = this.state.isDataOk;

    if (isDataOk && video.pic.indexOf("@400w_300h") === -1) {
      video.pic = this.getPicUrl(video.pic, "@400w_300h");
    }

    return (
      <div className="video-detail">
        <Helmet>
          <title>{video.title}</title>
          <meta name="title" content={video.title} />
          <meta name="description" content={video.desc} />
          <meta name="author" content={isDataOk ? video.owner.name : ""} />
        </Helmet>
        {
          !isDataOk ? <LoadingCutscene /> :
            <div>
              <div className={style.topWrapper} ref={this.topWrapperRef}>
                <HeaderWithBack />
              </div>
              {/* 内容 */}
              <div className={style.contentWrapper}>
                {/* 播放器 */}
                <div className={style.videoContainer}>
                  <VideoPlayer video={{
                    aId: video.aId,
                    cId: video.cId,
                    title: video.title,
                    cover: video.pic,
                    duration: video.duration,
                    url: video.url
                  }} />
                </div>
                {/* 视频信息 */}
                <div className={style.videoInfoContainer} ref={this.infoContainerRef}>
                  <span
                    className={style.iconArrow}
                    ref={this.arrowRef}
                    onClick={this.toggle}>
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-arrowDownBig"></use>
                    </svg>
                  </span>
                  <div className={style.infoWrapper} ref={this.infoRef}>
                    <div className={style.title}>
                      {video.title}
                    </div>
                    <div className={style.videoInfo}>
                      <span className={style.upUserIcon}>
                        <svg className="icon" aria-hidden="true">
                          <use href="#icon-uper"></use>
                        </svg>
                      </span>
                      <Link to={"/space/" + video.owner.mId}>
                        {/* <a href={"/space/" + video.owner.mId}> */}
                        <span className={style.upUserName}>{video.owner.name}</span>
                        {/* </a> */}
                      </Link>
                      <span className={style.play}>{formatTenThousand(video.playCount)}次观看</span>
                      <span>{formatTenThousand(video.barrageCount)}弹幕</span>
                      <span>{this.getPubdate(video.publicDate)}</span>
                    </div>
                    <div className={style.desc}>
                      {video.desc}
                    </div>
                    <div className={style.position}>
                      <a href="/index">主页</a>
                      <span>&gt;</span>
                      <a href={"/channel/" + video.twoLevel.id}>{video.twoLevel.name}</a>
                      <span>&gt;</span>
                      <span className={style.aid}>av{video.aId}</span>
                    </div>
                  </div>
                </div>
                {/* 切换推荐/评论 */}
                <div
                  className={style.switcher}
                  ref={this.switcherRef}
                >
                  <span
                    className={style.switcherItem + (this.state.isRecommend ? " " + style.actived : "")}
                    onClick={() => { this.switchBottom(1) }}
                  >相关推荐</span>
                  <span
                    className={style.switcherItem + (this.state.isRecommend ? "" : " " + style.actived)}
                    onClick={() => { this.switchBottom(2) }}
                  >评论 ({this.commentPage.count})</span>
                </div>
                <div className={style.bottomArea}>
                  <div className={style.bottomWrapper} ref={this.bottomWrapperRef}>
                    {/* 推荐列表 */}
                    <div
                      className={style.recommendList}
                      ref={this.recommendListRef}
                    >
                      {
                        this.state.recommendVides.map(v => (
                          <div className={style.videoWrapper} key={v.aId}>
                            <Link to={"/video/av" + v.aId}>
                              <div className={style.imageContainer}>
                                <span className={style.placeholder}>
                                  <svg className="icon" aria-hidden="true">
                                    <use href="#icon-placeholder"></use>
                                  </svg>
                                </span>
                                <LazyLoad height="10.575rem">
                                  <img src={this.getPicUrl(v.pic, "@320w_200h")} alt={v.title} />
                                </LazyLoad>
                                <div className={style.duration}>{formatDuration(v.duration, "0#:##:##")}</div>
                              </div>
                              <div className={style.infoWrapper}>
                                <div className={style.title}>
                                  {v.title}
                                </div>
                                <div className={style.upUser}>
                                  <span onClick={(e) => {
                                    e.preventDefault();
                                    this.toSpace(v.owner.mId)
                                  }}>
                                    {v.owner.name}
                                  </span>
                                </div>
                                <div className={style.videoInfo}>
                                  <span>{formatTenThousand(v.playCount)}次观看</span>
                                  <span>&nbsp;·&nbsp;</span>
                                  <span>{formatTenThousand(v.barrageCount)}弹幕</span>
                                </div>
                              </div>
                            </Link>
                          </div>
                        ))
                      }
                      {
                        this.state.loading ? (
                          <div className={style.loading}>加载中...</div>
                        ) : null
                      }
                    </div>
                    {/* 评论区 */}
                    {
                      this.state.comments.length > 0 ? (
                        <div
                          className={style.comment}
                          ref={this.commentAreaRef}
                        >

                          <div className={style.commentList}>
                            {
                              this.state.comments.map((comment, i) => (
                                <div className={style.commentWrapper} key={i}>
                                  <Link to={"/space/" + comment.user.mId}>
                                    <LazyLoad height="2rem">
                                      <img
                                        className={style.commentUpPic}
                                        src={this.getPicUrl(comment.user.face, "@60w_60h")}
                                        alt={comment.user.name}
                                      />
                                    </LazyLoad>
                                  </Link>
                                  <span className={style.commentTime}>{comment.date}</span>
                                  <div className={style.commentUpUser}>
                                    <Link to={"/space/" + comment.user.mId}>
                                      {comment.user.name}
                                    </Link>
                                  </div>
                                  <div className={style.commentContent}>
                                    {comment.content}
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                          <div className={style.commentsBottom}                          >
                            {
                              this.state.showLoadMore ? (
                                <div
                                  className={style.loadMore}
                                  onClick={() => { this.loadMoreComment() }}
                                >
                                  点击加载更多评论
                                </div>
                              ) : (
                                  <div className={style.noMore}>
                                    没有更多了 ~
                                  </div>
                                )
                            }
                          </div>
                        </div>
                      ) : null
                    }
                  </div>
                </div>
              </div>
              <ScrollToTop />
            </div>
        }
      </div>
    );
  }
}

VideoPage.contextType = Context;

export default VideoPage;