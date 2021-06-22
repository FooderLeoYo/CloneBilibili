import * as React from "react";
import { Link, match } from "react-router-dom";
import { Helmet } from "react-helmet";
import LazyLoad from "react-lazyload";
import { History } from "history";

import Context from "@context/index";
import { getRecommendVides, getComments, postViewedReport } from "@api/video";
import { getNavUserInfo } from "@api/login";
import storage from "@customed-methods/storage";
import getVideoDetail from "@redux/async-action-creators/video";
import { setShouldLoad } from "@redux/action-creators";

import LogoHeaderWithBack from "@root/src/components/logo-header-with-back/LogoHeaderWithBack";
import LoadingCutscene from "@components/loading-cutscene/LoadingCutscene";
import Player from "@components/player/Player";
import { Switcher } from "@components/switcher/Switcher";
import VideoItemLandscape from "@components/video-item-landscape/VideoItemLandscape";
import ScrollToTop from "@components/scroll-to-top/ScrollToTop";

import { Video, createVideo, UpUser } from "@class-object-creators/index";
import { getPicSuffix } from "@customed-methods/image";
import { formatDate } from "@customed-methods/datetime";
import { formatTenThousand } from "@customed-methods/string";

import style from "./video-page.styl?css-modules";

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
  recommendVideos: Video[];
  showLoadMore: boolean;
  comments: any;
  isSwitcherFixed: boolean;
  prevId: number;
  isViewed: boolean;
  isLogin: boolean;
}

class VideoPage extends React.Component<VideoPageProps, VideoPageState> {
  private topWrapperRef: React.RefObject<HTMLDivElement>;
  private videoRef: React.RefObject<HTMLVideoElement>;
  private arrowRef: React.RefObject<HTMLDivElement>;
  private infoContainerRef: React.RefObject<HTMLDivElement>;
  private infoRef: React.RefObject<HTMLDivElement>;
  private bottomAreaRef: React.RefObject<HTMLDivElement>;

  private infoExpand: boolean;
  private commentPage: { pageNumber: number, pageSize: number, count: number };
  private bottomContent: JSX.Element[];
  private bottomPos: number;

  constructor(props) {
    super(props);
    this.topWrapperRef = React.createRef();
    this.videoRef = React.createRef();
    this.arrowRef = React.createRef();
    this.infoContainerRef = React.createRef();
    this.infoRef = React.createRef();
    this.bottomAreaRef = React.createRef();
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
      recommendVideos: [],
      showLoadMore: true,
      comments: [],
      isSwitcherFixed: false,
      prevId: -999,
      isViewed: false,
      isLogin: false
    }
  }

  /* 数据获取相关 */
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
      publicDateStr = publicDate.getFullYear() + "-" + (publicDate.getMonth() + 1) + "-" + publicDate.getDate();
    }
    return publicDateStr;
  }

  private generateBottomTSX = () => {
    const { recommendVideos, comments } = this.state;
    if (recommendVideos && comments) {
      this.bottomContent = [
        // 推荐列表
        <div className={style.recommendList} key={"recommendList"}>
          {this.state.recommendVideos.map(video => (
            <div
              className={style.videoWrapper}
              key={video.aId}
              onClick={() => {
                if (this.state.isLogin && this.state.isViewed) {
                  postViewedReport({
                    aid: this.props.video.aId,
                    cid: this.props.video.cId,
                    progress: Math.floor(this.videoRef.current.currentTime) // 后台API要求取整
                  })
                }
              }}
            >
              <VideoItemLandscape
                videoData={video}
                imgParams={{
                  imgHeight: "10.575rem",
                  imgSrc: video.pic,
                  imgFormat: "@320w_200h"
                }}
              />
            </div>
          ))
          }
          {this.state.loading && <div className={style.loading}>加载中...</div>}
        </div>,
        // 评论区
        <div className={style.comment} key={"comment"}>
          <div className={style.commentList}>
            {this.state.comments.map((comment, i) => (
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
                  <Link to={"/space/" + comment.user.mId}>{comment.user.name}</Link>
                </div>
                <div className={style.commentContent}>{comment.content}</div>
              </div>
            ))
            }
          </div>
          <div className={style.commentsBottom}>
            {this.state.showLoadMore ?
              <div className={style.loadMore} onClick={() => { this.loadMoreComment() }}>
                点击加载更多评论</div> :
              <div className={style.noMore}>没有更多了 ~</div>
            }
          </div>
        </div>
      ];
    }
  }

  private getRecommentVideos() {
    getRecommendVides(this.props.match.params.aId)
      .then(result => {
        if (result.code === "1") {
          const recommendVideos = result.data.map(item => createVideo(item));
          this.setState({
            loading: false,
            recommendVideos
          }, () => this.generateBottomTSX());
        }
      });
  }

  private getComments() {
    getComments(this.props.match.params.aId, this.commentPage.pageNumber)
      .then(result => {
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
          }, () => this.generateBottomTSX());
        }
      });
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


  /* 切换相关 */
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

  /* 设置状态相关 */
  // 记录浏览历史信息
  private saveHistory(video) {
    const { aId, title, pic } = video;
    storage.setViewHistory({
      aId: aId,
      title: title,
      pic: pic,
      viewAt: new Date().getTime()
    });
  }

  private setInitStatus() {
    const vData = this.props.video;

    this.setState({ videoData: this.props.video, isDataOk: true });
    this.saveHistory(vData);

    getNavUserInfo().then(result => {
      if (result.data.code === 0) {
        this.setState({ isLogin: true });
      }
    })

    // 设置底部切换区域的位置，首次切换时都跳到这个位置
    // 不放在定时器里会报错找不到相关Dom节点
    setTimeout(() => {
      this.bottomPos = this.bottomAreaRef.current.offsetTop -
        this.topWrapperRef.current.offsetHeight;
    }, 1);
  }

  public componentDidMount() {
    const aID = this.props.match.params.aId;
    this.setState({ prevId: aID });

    this.getRecommentVideos();
    this.getComments();

    if (this.props.shouldLoad) {
      this.props.dispatch(getVideoDetail(aID)).then(() => this.setInitStatus());
    } else {
      this.setInitStatus();
      this.props.dispatch(setShouldLoad(true));
    }
  }

  // 没这个的话点推荐视频不能跳转
  public componentDidUpdate() {
    const aID = this.props.match.params.aId;
    if (aID !== this.state.prevId) {
      this.setState({
        isDataOk: false,
        videoData: {},
        prevId: aID
      });
      this.getRecommentVideos();
      this.getComments();
      this.props.dispatch(getVideoDetail(aID)).then(() => this.setInitStatus());
    }
  }

  /* 以下为渲染部分 */
  public render() {
    const { isDataOk, videoData } = this.state
    const { title, desc, owner, aId, cId, pic, duration, url, playCount, barrageCount,
      publicDate, twoLevel } = videoData;

    if (isDataOk && pic.indexOf("@400w_300h") === -1) {
      videoData.pic = this.getPicUrl(pic, "@400w_300h");
    }

    return (
      <div className="video-detail">
        <Helmet>
          <title>{title}</title>
          <meta name="title" content={title} />
          <meta name="description" content={desc} />
          <meta name="author" content={isDataOk ? owner.name : ""} />
        </Helmet>
        {!isDataOk ? <LoadingCutscene /> :
          <>
            <div className={style.topWrapper} ref={this.topWrapperRef}
              onClick={() => { if (this.state.isLogin && this.state.isViewed) { postViewedReport({ aid: aId, cid: cId, progress: Math.floor(this.videoRef.current.currentTime) }) } }}
            ><LogoHeaderWithBack /></div>
            {/* 内容 */}
            <div className={style.contentWrapper}>
              {/* 播放器 */}
              <div className={style.videoContainer}>
                <Player
                  video={{ aId: aId, cId: cId, title: title, cover: videoData.pic, duration: duration, url: url, }}
                  isLive={false}
                  videoRef={this.videoRef}
                  clickCover={() => {
                    this.setState({ isViewed: true });
                    if (this.state.isLogin) { postViewedReport({ aid: this.props.video.aId, cid: this.props.video.cId }); }
                  }}
                />
              </div>
              {/* 视频信息 */}
              <div className={style.videoInfoContainer} ref={this.infoContainerRef}>
                <span className={style.iconArrow} ref={this.arrowRef} onClick={this.toggle} >
                  <svg className="icon" aria-hidden="true">
                    <use href="#icon-arrowDownBig"></use>
                  </svg>
                </span>
                <div className={style.infoWrapper} ref={this.infoRef}>
                  <div className={style.title}>{title}</div>
                  <div className={style.videoInfo}>
                    <span className={style.upUserIcon}>
                      <svg className="icon" aria-hidden="true">
                        <use href="#icon-uper"></use>
                      </svg>
                    </span>
                    <Link to={"/space/" + owner.mId}>
                      <span className={style.upUserName}>{owner.name}</span>
                    </Link>
                    <span className={style.play}>{formatTenThousand(playCount)}次观看</span>
                    <span>{formatTenThousand(barrageCount)}弹幕</span>
                    <span>{this.getPubdate(publicDate)}</span>
                  </div>
                  <div className={style.desc}>{desc}</div>
                  <div className={style.position}>
                    <a href="/index">主页</a>
                    <span>&gt;</span>
                    <a href={"/channel/" + twoLevel.id}>{twoLevel.name}</a>
                    <span>&gt;</span>
                    <span className={style.aid}>av{aId}</span>
                  </div>
                </div>
              </div>
              <div className={style.bottomArea} ref={this.bottomAreaRef}>
                <Switcher
                  tabTitle={["相关推荐", `评论 (${this.commentPage.count})`]}
                  sliderData={this.bottomContent}
                  switchRatio={0.15}
                  scrollToAtFirstSwitch={this.bottomPos}
                />
              </div>
            </div>
            <ScrollToTop />
          </>
        }
      </div>
    );
  }
}

VideoPage.contextType = Context;

export default VideoPage;
