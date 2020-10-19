import * as React from "react";
import { Helmet } from "react-helmet";
import LazyLoad, { forceCheck } from "react-lazyload";
import { History } from "history";
import { Link, match } from "react-router-dom";

import TabBar from "../../components/tab-bar/TabBar";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";

import { setShouldLoad } from "../../redux/action-creators";
import { getRankingVideoList, getVideoList } from "../../redux/async-action-creators/ranking";
import Context from "../../context";

import { PartitionType, Video } from "../../class-object-creators";
import { getPicSuffix } from "../../customed-methods/image";
import { formatTenThousand } from "../../customed-methods/string";
import style from "./ranking.styl?css-modules";

interface RankingProps {
  shouldLoad: boolean;
  rankingPartitions: PartitionType[];
  rankingVideos: Video[];
  match: match<{ rId }>;
  dispatch: (action: any) => Promise<void>;
  staticContext?: { picSuffix: string };
  history: History;
}

interface RankingState {
  currentTabIndex: number;
  loading: boolean; // 是否显示“(´・ω・｀)正在加载...”
}

class Ranking extends React.Component<RankingProps, RankingState> {
  /* 以下为初始化 */
  constructor(props) {
    super(props);
    const { shouldLoad } = props;
    this.state = {
      currentTabIndex: props.rankingPartitions.findIndex(parittion =>
        parittion.id === parseInt(props.match.params.rId, 10)
      ),
      loading: shouldLoad
    }
  }

  /* 以下为自定义方法 */
  private getPicUrl(url, format) {
    const { picURL } = this.context;
    let suffix = ".webp";
    if (process.env.REACT_ENV === "server") {
      // 服务端获取图片后缀
      suffix = this.props.staticContext.picSuffix;
    } else {
      suffix = getPicSuffix();
    }
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  public handleClick = tab => {
    const currentTabIndex = this.props.rankingPartitions.findIndex((parittion) =>
      parittion.id === parseInt(tab.id, 10)
    );
    // 将this.state.currentTabIndex改成当前点击项
    this.setState({
      currentTabIndex,
      loading: true
    });
    // 获取currentTabIndex对应的展示数据并保存到store中
    this.props.dispatch(getVideoList(tab.id))
      .then(() => {
        this.setState({ loading: false });
      });
  }

  /* 以下是生命周期函数 */
  public componentDidMount() {
    if (this.props.shouldLoad) {
      this.props.dispatch(getRankingVideoList(this.props.match.params.rId))
        .then(() => {
          this.setState({ loading: false });
        });
    } else {
      this.props.dispatch(setShouldLoad(true));
    }
    setTimeout(() => {
      forceCheck();
    }, 10);
  }

  // getSnapshotBeforeUpdate的返回值将作为 componentDidUpdate() 的第三个参数
  public getSnapshotBeforeUpdate() {
    return document.documentElement.scrollTop || document.body.scrollTop > 0
  }

  public componentDidUpdate(prevProps, prevState, scroll) {
    if (scroll) {
      window.scrollTo(0, 0);
    }
  }

  /* 以下为渲染部分 */
  public render() {
    const { rankingPartitions, rankingVideos } = this.props;
    const currentPartition = rankingPartitions[this.state.currentTabIndex];
    return (
      <div className="ranking">
        {
          currentPartition ? (
            <Helmet>
              <title>{currentPartition.name + "-排行榜"}</title>
            </Helmet>
          ) : null
        }
        <div className={style.topWrapper}>
          {/* 头部 */}
          <div className={style.header}>
            <span
              onClick={() => { window.history.back(); }}
              className={style.backBtn}
            >
              <svg className="icon" aria-hidden="true">
                <use href="#icon-back"></use>
              </svg>
            </span>
            <span>排行榜</span>
          </div>
          {/* tabbar */}
          <TabBar
            data={rankingPartitions}
            type={"indicate"}
            currentIndex={this.state.currentTabIndex}
            onClick={this.handleClick}
          />
        </div>
        <div className={style.topBottom} />
        {/* 排行榜 */}
        <div className={style.rankingList}>
          {
            rankingVideos.map((video, i) => (
              <div className={style.videoWrapper} key={i}>
                {/* <a href={"/video/av" + video.aId} > */}
                <Link to={"/video/av" + video.aId}>
                  <div className={style.ranking}>
                    {/* 排名序号 */}
                    {
                      // 排行前3名序号是奖牌
                      i < 3 ? (
                        <svg className="icon" aria-hidden="true">
                          <use href={`#icon-rank${i + 1}`}></use>
                        </svg>
                      ) : i + 1
                    }
                  </div>
                  <div className={style.info}>
                    {/* 视频封面 */}
                    <div className={style.imageContainer}>
                      <span className={style.placeholder}>
                        <svg className="icon" aria-hidden="true">
                          <use href="#icon-placeholder"></use>
                        </svg>
                      </span>
                      <LazyLoad height={"5.875rem"}>
                        <img
                          src={this.getPicUrl(video.pic, "@200w_125h")}
                          alt={video.title}
                        />
                      </LazyLoad>
                    </div>
                    {/* 视频信息 */}
                    <div className={style.infoWrapper}>
                      <p>{video.title}</p>
                      <div className={style.ownerWrapper}>
                        <span className={style.iconUp} >
                          <svg className="icon" aria-hidden="true">
                            <use href="#icon-uper"></use>
                          </svg>
                        </span>
                        <span className={style.owner}>{video.owner.name}</span>
                      </div>
                      <div className={style.countInfo}>
                        <span className={style.iconPlay} >
                          <svg className="icon" aria-hidden="true">
                            <use href="#icon-playCount"></use>
                          </svg>
                        </span>
                        <span className={style.playCount}>
                          {formatTenThousand(video.playCount)}
                        </span>
                        <span className={style.iconBarrage} >
                          <svg className="icon" aria-hidden="true">
                            <use href="#icon-barrageCount"></use>
                          </svg>
                        </span>
                        <span className={style.barrageCount}>
                          {formatTenThousand(video.barrageCount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                {/* </a> */}
              </div>
            ))
          }
        </div>
        {/* 等待加载 */}
        {
          this.state.loading ? (
            <div className={style.loading}>
              (´・ω・｀)正在加载...
            </div>
          ) : null
        }
        <ScrollToTop />
      </div>
    );
  }
}

Ranking.contextType = Context;

export default Ranking;
