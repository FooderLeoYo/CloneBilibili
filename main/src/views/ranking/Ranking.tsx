import * as React from "react";
import { Helmet } from "react-helmet";
import { History } from "history";
import { match } from "react-router-dom";
import { forceCheck } from "react-lazyload";

import Header from "./child-components/header/Header";
import TabBar from "../../components/tab-bar/TabBar";
import RankingList from "./child-components/ranking-list/RankingList";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";

import { setShouldLoad } from "../../redux/action-creators";
import { getRankingVideoList, getVideoList } from "../../redux/async-action-creators/ranking";

import { PartitionType, Video } from "../../class-object-creators";
import style from "./ranking.styl?css-modules";

interface RankingProps {
  shouldLoad: boolean;
  rankingPartitions: PartitionType[];
  rankingVideos: Video[];
  match: match<{ rId }>;
  dispatch: (action: any) => Promise<void>;
  history: History;
  staticContext?: { picSuffix: string };
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
      currentTabIndex: 0,
      loading: shouldLoad
    };
  }

  public handleClick = tab => {
    const tabID = tab.id;
    const currentTabIndex = this.props.rankingPartitions.findIndex(parittion =>
      parittion.id === parseInt(tabID, 10)
    );
    this.setState({
      currentTabIndex,
      loading: true
    });
    // 这里不用history.push是因为按返回时需要回到channhel
    // 如果用了push那么返回的将是前一个点击的tab
    this.props.dispatch(getVideoList(tabID))
      .then(() => { this.setState({ loading: false }); });
  }

  /* 以下是生命周期函数 */
  public componentDidMount() {
    if (this.props.shouldLoad) {
      this.props.dispatch(getRankingVideoList(this.props.match.params.rId))
        .then(() => {
          this.setState({
            currentTabIndex: this.props.rankingPartitions.findIndex(parittion =>
              parittion.id === parseInt(this.props.match.params.rId, 10))
          });
          this.setState({ loading: false });
        });
    } else { this.props.dispatch(setShouldLoad(true)); }

    setTimeout(() => { forceCheck(); }, 10);
  }

  public getSnapshotBeforeUpdate() {
    return document.documentElement.scrollTop || document.body.scrollTop > 0
  }

  public componentDidUpdate(prevProps, prevState, scroll) {
    if (scroll) { scrollTo(0, 0); }
  }

  public render() {
    const { rankingPartitions, rankingVideos } = this.props;
    const currentPartition = rankingPartitions[this.state.currentTabIndex];
    return (
      <div className="ranking">
        {
          currentPartition &&
          <Helmet>
            <title>{currentPartition.name + "-排行榜"}</title>
          </Helmet>
        }
        <div className={style.topWrapper}>
          <Header />
          <TabBar
            data={rankingPartitions}
            needUnderline={true}
            currentIndex={this.state.currentTabIndex}
            clickMethod={this.handleClick}
            needForcedUpdate={true}
          />
        </div>
        <div className={style.topBottom} />
        <div className={style.rankingList}>
          <RankingList
            rankingVideos={rankingVideos}
            picSuffix={this.props.staticContext?.picSuffix}
          />
        </div>
        {this.state.loading && <div className={style.loading}>(´・ω・｀)正在加载...</div>}
        <ScrollToTop />
      </div>
    );
  }
}

export default Ranking;
