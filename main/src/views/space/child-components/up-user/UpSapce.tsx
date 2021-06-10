import * as React from "react";
import { match } from "react-router-dom";
import { Helmet } from "react-helmet";

import Context from "../../../../context";
import { setShouldLoad } from "../../../../redux/action-creators";
import getUser from "../../../../redux/async-action-creators/space";
import { getUserVideos } from "../../../../api/space";

import { Video, createVideoByUser } from "../../../../class-object-creators";
import { UpUser as Model } from "../../../../class-object-creators";
import ScrollToTop from "../../../../components/scroll-to-top/ScrollToTop";
import VideoItemLandscape from "../../../../components/video-item-landscape/VideoItemLandscape";

import { formatTenThousand } from "../../../../customed-methods/string";
import { getPicSuffix } from "../../../../customed-methods/image";

import tips from "../../../../assets/images/nocontent.png";
import style from "./up-space.styl?css-modules";

interface UpUserProps {
  shouldLoad: boolean;
  upUser: Model;
  videos: Video[];
  dispatch: (action: any) => Promise<void>;
  match: match<{ mId }>;
  staticContext?: { picSuffix: string };
}

interface UpUserState {
  loading: boolean;
  showLoadMore: boolean;
  videos: Video[];
}

class UpSapce extends React.Component<UpUserProps, UpUserState> {
  /* 以下为初始化 */
  private arrowRef: React.RefObject<HTMLDivElement>; // 展开个人简介箭头
  private introduceRef: React.RefObject<HTMLDivElement>; // up主个人信息区
  private contentRef: React.RefObject<HTMLDivElement>; // up主自我介绍
  private contentExpand: boolean;
  private sexClass: any;
  private videoPage: { pageNumber: number, pageSize: number };
  constructor(props) {
    super(props);
    this.arrowRef = React.createRef();
    this.introduceRef = React.createRef();
    this.contentRef = React.createRef();
    this.contentExpand = false;
    this.sexClass = {
      男: "sexMan",
      女: "sexWoman",
      保密: "sexSecrecy"
    }
    this.videoPage = {
      pageNumber: 1,
      pageSize: 10
    }
    this.state = {
      loading: true,
      showLoadMore: true,
      videos: []
    }
  }

  /* 以下为自定义方法 */
  //  若自我介绍太长则显示展开个人简介箭头
  private initToggle() {
    const arrowDOM = this.arrowRef.current;
    const introduceDOM = this.introduceRef.current;
    const contentDOM = this.contentRef.current;

    if (contentDOM.offsetHeight <= introduceDOM.offsetHeight) {
      arrowDOM.style.visibility = "hidden";
    } else { arrowDOM.style.visibility = "visible"; }
  }

  private getUserVideos() {
    getUserVideos(
      this.props.match.params.mId,
      this.videoPage.pageNumber,
      this.videoPage.pageSize
    ).then(result => {
      if (result.code === "1") {
        const vList = result.data.list.vlist;
        const videos = vList.map(data => createVideoByUser(data));
        const showLoadMore = this.videoPage.pageNumber < result.data.page.count ? true : false;
        this.setState({
          loading: false,
          showLoadMore,
          videos: this.state.videos.concat(videos)
        });
      }
    });
  }

  // 展开或隐藏个人简介
  private toggle = () => {
    const arrowDOM = this.arrowRef.current;
    const introduceDOM = this.introduceRef.current;
    const contentDOM = this.contentRef.current;
    if (this.contentExpand === false) {
      introduceDOM.style.height = contentDOM.offsetHeight + "px";
      arrowDOM.classList.add(style.rotate);
      this.contentExpand = true;
    } else {
      introduceDOM.style.height = null;
      arrowDOM.classList.remove(style.rotate);
      this.contentExpand = false;
    }
  }

  private loadMoreVideos() {
    this.videoPage.pageNumber += 1;
    this.getUserVideos();
  }

  private getPicUrl(url, format) {
    const { picURL } = this.context;
    let suffix = ".webp";
    if (process.env.REACT_ENV === "server") {
      // 服务端获取图片后缀
      suffix = this.props.staticContext.picSuffix;
    } else { suffix = getPicSuffix(); }
    // 默认头像
    if (url.indexOf(".gif") !== -1) { return `${picURL}?pic=${url}`; }
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  /* 以下为生命周期函数 */
  public componentDidMount() {
    this.initToggle();

    if (this.props.shouldLoad) {
      // 这里也可以将getUser添加到本组件中，就像getUserVideos
      // 然后调用组件自己的方法获取数据，而不是先存到redux，再从redux中取

      // 不这么做的原因是up信息只需要获取一次，而getUserVideos由于有加载更多需要多次调用
      // 而且需要通过state.videos.length，设置加载中，以避免数据未加载报错
      // 所以getUserVideos是肯定要添加到组件自身的
      // 这同时也是upUser从props中取，而videos从state中取的原因

      // getUser出于代码冗余的考虑则没有添加到组件
      // 虽然从性能上说应该比多倒一次redux要好，但是代码多则bundle大
      // 评估后认为bundle下载时间造成的影响 > 多一步redux造成的性能影响
      this.props.dispatch(getUser(this.props.match.params.mId))
        .then(() => { this.setState({ videos: this.props.videos }); });
    } else {
      this.setState({ videos: this.props.videos });
      this.props.dispatch(setShouldLoad(true))
    }
  }

  public componentDidUpdate() {
    this.initToggle();
  }

  /* 以下为渲染部分 */
  public render() {
    const { upUser } = this.props;

    return (
      <div className={style.upSapce}>
        {upUser && <Helmet><title>{upUser.name + "的个人空间"}</title></Helmet>}
        <div className={style.upUserContainer}>
          <div className={style.face}>
            {upUser.face ?
              <img src={this.getPicUrl(upUser.face, "@160w_160h")} alt={upUser.name} /> :
              <svg className="icon" aria-hidden="true">
                <use href="#icon-avatar"></use>
              </svg>
            }
          </div>
          <div className={style.info}>
            <span className={style.name}>{upUser.name ? upUser.name : "--"}</span>
            <span className={style.sex} >
              <svg className="icon" aria-hidden="true">
                <use href={`#icon-${this.sexClass[upUser.sex]}`}></use>
              </svg>
            </span>
            {upUser.level &&
              <span className={style.level}>
                <svg className="icon" aria-hidden="true">
                  <use href={`#icon-lv${upUser.level}`}></use>
                </svg>
              </span>
            }
            <span className={style.uid}>UID:{upUser.mId}</span>
          </div>
          <div className={style.detail}>
            <div className={style.stats}>
              <span className={style.follow}>
                {upUser.following ? formatTenThousand(upUser.following) : "--"}&nbsp;
              </span>关注
              <span className={style.fans}>
                {upUser.follower ? formatTenThousand(upUser.follower) : "--"}&nbsp;
              </span>粉丝
            </div>
            <div className={style.introduce} ref={this.introduceRef}>
              <span
                className={style.iconArrow}
                ref={this.arrowRef}
                onClick={this.toggle}>
                <svg className="icon" aria-hidden="true">
                  <use href="#icon-arrowDownBig"></use>
                </svg>
              </span>
              <div className={style.content} ref={this.contentRef}>{upUser.sign}</div>
            </div>
          </div>
        </div>
        {/* up主投稿 */}
        <div className={style.masterpiece}>
          <div className={style.title}>Ta的投稿</div>
          <div className={style.videoList}>
            {this.state.videos.length !== 0 &&
              this.state.videos.map(video => (
                <div className={style.videoWrapper} key={video.aId}>
                  <VideoItemLandscape
                    videoData={video}
                    imgParams={{
                      imgHeight: "3.654rem",
                      imgSrc: video.pic,
                      imgFormat: "@200w_125h"
                    }}
                    noOwner={true}
                  />
                </div>
              ))
            }
          </div>
          {this.state.videos.length > 0 && this.state.showLoadMore &&
            <div className={style.loadMore} onClick={() => { this.loadMoreVideos() }}>
              刚刚看到这里，点击加载更多~
            </div>
          }
          {this.state.loading && <div className={style.loading}>加载中...</div>}
          {!this.state.loading && this.state.videos.length === 0 &&
            <div className={style.tips}>
              <img src={tips} />
              <span className={style.text}>Ta还没有投过稿~</span>
            </div>
          }
        </div>
        <ScrollToTop />
      </div>
    );
  }
}

UpSapce.contextType = Context;

export default UpSapce;
