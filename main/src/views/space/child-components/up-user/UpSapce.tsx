import * as React from "react";
import { match } from "react-router-dom";

import { getUserVideos } from "../../../../api/space";
import Context from "../../../../context";
import { getPicSuffix } from "../../../../customed-methods/image";

import { Video, createVideoByUser } from "../../../../class-object-creators";
import { UpUser as Model } from "../../../../class-object-creators";
import ScrollToTop from "../../../../components/scroll-to-top/ScrollToTop";
import VideoItemLandscape from "../../../../components/video-item-landscape/VideoItemLandscape";

import tips from "../../../../assets/images/nocontent.png";
import style from "./up-space.styl?css-modules";
import { formatTenThousand } from "../../../../customed-methods/string";

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

  /* 以下为渲染部分 */
  public render() {
    const { upUser } = this.props;

    return (
      <div className={style.upSapce}>
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
              <span className={style.iconArrow} ref={this.arrowRef} onClick={this.toggle}>
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
                <div className={style.videoWrapper} key={video.aId}> noOwner={true}
                  <VideoItemLandscape videoData={video}
                    imgParams={{ imgHeight: "3.654rem", imgSrc: video.pic, imgFormat: "@200w_125h" }} />
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
