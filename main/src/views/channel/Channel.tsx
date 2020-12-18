import * as React from "react";
import { forceCheck } from "react-lazyload";
import { match } from "react-router-dom";
import { Helmet } from "react-helmet";
import { History } from "history";

import Context from "../../context";
import { setShouldLoad } from "../../redux/action-creators";
import getPartitionList from "../../redux/async-action-creators/channel";
import { getRankingRegion } from "../../api/ranking";
import { getRankingPartitions } from "../../api/partitions";

import { PartitionType, createPartitionTypes, Video, createVideoByRanking } from "../../class-object-creators";
import LoadingCutscene from "../../components/loading-cutscene/LoadingCutscene";
import Header from "../../components/header/Header";
import TabBar from "../../components/tab-bar/TabBar";
import VideoItem from "../../components/video-item/VideoItem";
import Drawer from "../../components/drawer/Drawer";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";
import Partition from "./child-components/Partition";
import VideoLatest from "./child-components/VideoLatest";

import { getPicSuffix } from "../../customed-methods/image";
import style from "./stylus/channel.styl?css-modules";

interface ChannelProps {
  shouldLoad: boolean;
  partitions: PartitionType[];
  match: match<{ rId }>;
  history: History;
  staticContext?: { picSuffix: string };
  dispatch: (action: any) => Promise<void>;
}

interface ChannelState {
  isDataOk: boolean;
  hotVideos: Video[]; // 4个热门推荐视频
  lvTwoParHotVideos: any; // 所有二级分类的推荐视频，每种分类4个
  prevId: number; // 用于判断rId是否改变，如果变了则清空之前数据
}

const initVideos = []; // 数据还未加载前，推荐视频VideoItem的默认值
for (let i = 0; i < 4; i++) {
  initVideos.push(new Video(0, "加载中...", "", "", 0, 0, 0, 0, 0, ""));
}

class Channel extends React.Component<ChannelProps, ChannelState> {
  /* 以下为初始化 */
  private lvOneTabData: PartitionType[];
  private curLvOneTabIndex: number;
  private lvOnePartition: PartitionType; // 当前一级分类
  private lvTwoTabData: PartitionType[];
  private prevLvTwoTabIndex: number;
  private curLvTwoTabIndex: number;
  private lvTwoPartition: PartitionType;
  private isRecAndChildrenGtTwo: boolean;
  private drawerRef: React.RefObject<Drawer>;
  private videoLatestId: number;
  private rankingPartitions: PartitionType[]; // 用于获取点击“排行榜”后，跳转到的url中最后的id
  private history: History;
  private shouldLoad: boolean;
  private dispatch: (action: any) => Promise<void>;


  constructor(props) {
    super(props);
    this.drawerRef = React.createRef();
    this.prevLvTwoTabIndex = 0;
    this.history = props.history;
    this.shouldLoad = props.shouldLoad;
    this.dispatch = props.dispatch;

    this.state = {
      isDataOk: false,
      hotVideos: initVideos,
      lvTwoParHotVideos: [],
      prevId: -999,
    };
  }

  /* 以下为自定义方法 */

  /* 获取数据相关 */
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

  private loadSecRecVideos() {
    const rId = this.props.match.params.rId;
    getRankingRegion({ rId, day: 7 }).then(result => {
      if (result.code === "1") {
        const datas = result.data.splice(0, 4);
        const hotVideos = datas.map(data => createVideoByRanking(data));

        this.setState({ hotVideos });
      }
    });
  }

  private loadAllSecRecVideos() {
    const lvTwoPartitions = this.lvOnePartition.children;
    const promises = lvTwoPartitions.map(partition =>
      getRankingRegion({ rId: partition.id, day: 7 })
    );

    Promise.all(promises).then(results => {
      const partitions = [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        // result.code是express发送的res中附带的一个自定义属性，规定1表示成功
        if (result.code === "1") {
          const partition = lvTwoPartitions[i];
          partitions.push({
            id: partition.id,
            name: partition.name,
            videos: result.data.splice(0, 4).map(data => createVideoByRanking(data))
          });
        }
      }

      this.setState({ lvTwoParHotVideos: partitions });
    })
  }

  // 生成一级tab数据
  private getLvOneTabData() {
    const { partitions } = this.props;

    // 一级tab添加“首页”和“直播”
    this.lvOneTabData = [{ id: 0, name: "首页", children: [] } as PartitionType]
      .concat(partitions);
    this.lvOneTabData.push(new PartitionType(-1, "直播"));
  }


  /* 点击相关 */
  private handleSwitchClick = () => {
    this.drawerRef.current.show();
  }

  private handleRankingClick = lvOnePartition => {
    if (this.rankingPartitions.length > 0) {
      // 从一级分类中查找与当前ranking分类相同的ranking分类
      if (this.rankingPartitions.findIndex(partition =>
        partition.id === lvOnePartition.id) !== -1) {
        // window.location.href = "/ranking/" + lvOnePartition.id
        this.history.push({ pathname: "/ranking/" + lvOnePartition.id });
      } else {
        // 如果一级分类中没有，则从二级分类中查找
        const partitionType = this.rankingPartitions.find(partition =>
          lvOnePartition.children.findIndex(p =>
            p.id === partition.id) !== -1
        );
        // window.location.href = "/ranking/" + partitionType.id
        this.history.push({ pathname: "/ranking/" + partitionType.id });
      }
    }
  }

  private handleClick = tab => {
    if (tab.id !== this.curLvOneTabIndex) {
      // 当前分类为直播
      if (tab.id === -1) {
        // window.location.href = "/live";
        this.history.push({
          pathname: "/live"
        });
        return;
      }
      if (tab.id === 0) {
        // window.location.href = "/index";
        this.history.push({
          pathname: "/index"
        });
      } else {
        this.setState({ isDataOk: false });

        this.history.push({
          pathname: "/channel/" + tab.id
        });
        // 这里如果不放到延时里，setAllData里的方法调用时，tab.id还没来得及变
        setTimeout(() => {
          this.setAllData();
        }, 1);

        // 如果是通过drawer点击的分类，则点击后隐藏drawer
        if (this.drawerRef.current.pull) {
          this.drawerRef.current.hide();
        }
      }
    }
  }

  private handleSecondClick = tab => {
    this.setTabIndex(tab.id);

    if (this.prevLvTwoTabIndex !== this.curLvTwoTabIndex) {
      this.setState({ isDataOk: false });

      this.history.push({
        pathname: "/channel/" + tab.id
      });
      setTimeout(() => {
        this.setAllData();
        // 非“推荐”时才需要加载最新视频数据
        if (this.curLvTwoTabIndex !== 0) {
          this.setvideoLatestId();
        }
        this.prevLvTwoTabIndex = this.curLvTwoTabIndex;
      }, 1);
    }
  }


  /* 设置tab相关 */
  private setTabIndex = id => {
    this.curLvOneTabIndex = this.lvOneTabData.findIndex(parittion => {
      this.curLvTwoTabIndex = parittion.children.findIndex(child =>
        child.id === parseInt(id, 10)
      );
      return this.curLvTwoTabIndex !== -1;
    });
    this.lvOnePartition = this.lvOneTabData[this.curLvOneTabIndex];
    this.curLvTwoTabIndex += 1;
  }

  private setTabIndexAndLvOnePar() {
    const { match: m } = this.props;

    // 当前m.params.rId是一级分类的，即此时的二级分类为“推荐”
    // 设置这种情况下的curLvOneTabIndex、lvOnePartition
    this.curLvOneTabIndex = this.lvOneTabData.findIndex(parittion =>
      parittion.id === parseInt(m.params.rId, 10)
    );
    this.lvOnePartition = this.lvOneTabData[this.curLvOneTabIndex];

    // 当前m.params.rId是二级分类的，即此时的二级分类非“推荐”
    // 设置这种情况下的curLvOneTabIndex、lvOnePartition，以及
    // 设置curLvTwoTabIndex
    this.curLvTwoTabIndex = 0;
    if (!this.lvOnePartition) {
      // 根据二级分类查找对应一级分类
      this.setTabIndex(m.params.rId);
    }
  }

  private setLvTwoTabDataAndPar() {
    // 设置lvTwoTabData、lvTwoPartition
    this.lvTwoTabData = [{ id: this.lvOnePartition.id, name: "推荐" } as PartitionType]
      .concat(this.lvOnePartition.children);

    // 如果此时的二级分类非“推荐”
    if (this.curLvTwoTabIndex !== 0) {
      this.lvTwoPartition = this.lvTwoTabData[this.curLvTwoTabIndex];
    }
  }


  /* 设置其他数据相关 */
  private setParOrLatest() {
    this.isRecAndChildrenGtTwo =
      this.curLvTwoTabIndex === 0 && this.lvOnePartition.children.length > 1
  }

  private setvideoLatestId() {
    const { match: m } = this.props;

    this.videoLatestId = this.isRecAndChildrenGtTwo ?
      m.params.rId :  // 当前的二级分类为“推荐”，且二级分类有两个或以上
      this.lvOnePartition.children.length > 1 ? // 如果此时的二级分类非“推荐”
        this.lvOnePartition.children[this.curLvTwoTabIndex - 1].id : // 二级分类有两个或以上取当前二级分类
        this.lvOnePartition.children[0].id; // 只有一个二级分类取第一个
  }

  // 获取排行榜分类的信息，包含name和id
  private setrankingPartitions() {
    getRankingPartitions().then(result => {
      if (result.code === "1") {
        this.rankingPartitions = createPartitionTypes(result.data);
      }
    });
  }

  private setVideoData() {
    this.loadSecRecVideos();
    // 如果二级tab是“推荐”
    if (this.curLvTwoTabIndex === 0) {
      this.loadAllSecRecVideos();
    }
  }

  private async setAllData() {
    await this.setTabIndexAndLvOnePar();
    await this.setLvTwoTabDataAndPar();
    await this.setVideoData();
    await this.setParOrLatest();
    setTimeout(() => {
      this.setState({ isDataOk: true });
    }, 1);
  }

  private setInitData() {
    this.setrankingPartitions();
    this.getLvOneTabData();
    this.setAllData();
  }

  /* 以下为生命周期函数 */
  public componentDidMount() {
    if (this.shouldLoad) {
      this.dispatch(getPartitionList())
        .then(() => { this.setInitData(); })
    } else {
      this.setInitData();
      this.dispatch(setShouldLoad(true));
    }

    setTimeout(() => {
      // 开发环境中，样式在js加载后动态添加会导致图片被检测到未出现在屏幕上
      // 强制检查懒加载组件是否出现在屏幕上
      forceCheck();
    }, 10);
  }

  // 如果不用这个进行清空，在切换时之前的内容会短暂停留
  public static getDerivedStateFromProps(props, state) {
    const rId = parseInt(props.match.params.rId, 10);

    // render前进行rId比较，如果rId变了
    if (rId !== state.prevId) {
      // 则清空之前的state数据
      return {
        hotVideos: initVideos,
        partitions: [],
        prevId: rId
      };
    }

    return null;
  }

  public getSnapshotBeforeUpdate() {
    return document.documentElement.scrollTop || document.body.scrollTop > 0
  }

  // 若组件更新后窗口发生滚动不处于顶端，则将其调整到最顶端
  public componentDidUpdate(prevProps, prevState, scroll) {
    if (scroll) {
      window.scrollTo(0, 0);
    }
  }

  /* 以下为渲染部分 */
  public render() {
    return (
      <div className="channel">
        <Helmet>
          <title>{
            this.lvOnePartition ?
              this.lvOnePartition.name + (this.lvTwoPartition ? "-" +
                this.lvTwoPartition.name : "") : null
          }</title>
        </Helmet>
        {
          !this.state.isDataOk ? <LoadingCutscene /> :
            <>
              {/* 顶部 */}
              <div className={style.topWrapper}>
                <Header />
                {/* 一级分类Tab */}
                <div className={style.partition}>
                  <div className={style.tabBar}>
                    <TabBar
                      data={this.lvOneTabData}
                      type={"indicate"}
                      currentIndex={this.curLvOneTabIndex}
                      onClick={this.handleClick}
                    />
                  </div>
                  <div className={style.switch} onClick={this.handleSwitchClick}>
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-arrowDownBig"></use>
                    </svg>
                  </div>
                </div>
                {/* 抽屉 */}
                <div className={style.drawerPosition}>
                  <Drawer
                    data={this.lvOneTabData}
                    ref={this.drawerRef}
                    currentIndex={this.curLvOneTabIndex}
                    onClick={this.handleClick}
                  />
                </div>
                {/* 二级分类Tab */}
                {
                  this.lvOnePartition.children.length > 1 ? (
                    <div className={style.secondTabBar}>
                      <TabBar
                        data={this.lvTwoTabData}
                        type={"hightlight"}
                        currentIndex={this.curLvTwoTabIndex}
                        onClick={this.handleSecondClick}
                      />
                    </div>
                  ) : null
                }
              </div>
              <div className={this.lvOnePartition.children.length > 1 ?
                style.specialLine1 : style.specialLine2} />
              <div className={style.partitionWrapper}>
                {/* 热门推荐 */}
                <div className={style.recommend}>
                  <div className={style.title}>热门推荐</div>
                  { // 排行榜
                    this.isRecAndChildrenGtTwo ?
                      <div
                        className={style.ranking}
                        onClick={() => { this.handleRankingClick(this.lvOnePartition) }}
                      >
                        <svg className="icon" aria-hidden="true">
                          <use href="#icon-ranking"></use>
                        </svg>
                        <span className={style.text}>排行榜</span>
                        <span className={style.more}>
                          <svg className="icon" aria-hidden="true">
                            <use href="#icon-back"></use>
                          </svg>
                        </span>
                      </div>
                      : null
                  }
                  {/* 4个热门推荐视频 */}
                  <div className={style.recommendContent + " clear"}>
                    {
                      this.state.hotVideos.map((video, i) => {
                        if (video.pic && video.pic.indexOf("@320w_200h") === -1) {
                          video.pic = this.getPicUrl(video.pic, "@320w_200h");
                        }
                        return <VideoItem
                          video={video} key={i} showStatistics={true} lazyOffset={100}
                        />
                      })
                    }
                  </div>
                </div>
                { // 分类推荐视频或最新视频
                  this.isRecAndChildrenGtTwo ?
                    // 当前二级分类为“推荐”，则显示分类推荐视频
                    this.state.lvTwoParHotVideos.map(partition =>
                      <Partition
                        data={partition}
                        history={this.history}
                        getPicUrl={(url, format) => this.getPicUrl(url, format)}
                        key={partition.id}
                      />
                    ) :
                    // 当前二级分类为非“推荐”或一级分类只有一个二级分类，则显示最新视频
                    <VideoLatest
                      id={this.videoLatestId}
                      getPicUrl={(url, format) => this.getPicUrl(url, format)}
                    />
                }
              </div>
              <ScrollToTop />
            </>
        }
      </div>
    );
  }
}

Channel.contextType = Context;

export default Channel;
