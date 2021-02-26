import * as React from "react";
import { forceCheck } from "react-lazyload";
import "swiper/dist/css/swiper.css";
import { History } from "history";

import Context from "../../context";
import { setShouldLoad } from "../../redux/action-creators";
import getIndexContent from "../../redux/async-action-creators/index";

import { PartitionType, Video } from "../../class-object-creators";
import LoadingCutscene from "../../components/loading-cutscene/LoadingCutscene";
import Header from "../../components/header/Header";
import TabBar from "../../components/tab-bar/TabBar";
import Drawer from "../../components/drawer/Drawer";
import VideoItem from "../../components/video-item/VideoItem";
import ScrollToTop from "../../components/scroll-to-top/ScrollToTop";

import { getPicSuffix } from "../../customed-methods/image";

// 这里用到css-modules，目的是实现类名不重复，防止css样式冲突
// style是xx?css-modules在styles.d.ts中被declare后，导出的的StyleModule类型的常量
// 用以在需要使用的地方代替该名字较长的css-modules
// 需要为某个元素添加样式时：
//   1. 该元素添加"className={style.自定义名（驼峰）}"
//   2. 在.styl文件中添加.自定义名（-分割）的样式
import style from "./index.styl?css-modules";

// 定义props和state的interface的作用是约束props和state中的变量，即：
// 1. 限制变量的type
// 2. 限制了props和state中有效的变量，即：
//    如果某个参数和interface声明中不一样（变量名不同也不行），则该变量无效
//    即无法通过this.state或this.props调用它

interface IndexProps {
  shouldLoad: boolean;
  oneLevelPartitions: PartitionType[];
  banners: Array<{ id: number, name: string, pic: string, url: string }>;
  additionalVideos: Video[];
  rankingVideos: Video[];
  staticContext?: { picSuffix: string };
  history: History;
  dispatch: (action: any) => Promise<void>;
}

interface IndexState {
  isDataOk: boolean
}

// 这里Index继承了IndexProps，则Index的props和state中的变量将受到interface IndexProps声明中的约束
class Index extends React.Component<IndexProps, IndexState> {
  /* 以下为初始化 */
  private drawerRef: React.RefObject<Drawer>;
  constructor(props) {
    super(props);
    // React.createRef()相当于创建了一个空的ref
    // 在渲染部分可以将其帮顶给某个dom节点
    this.drawerRef = React.createRef();

    this.state = { isDataOk: false }
  }

  /* 以下为自定义方法 */
  // 这里的tab不需要在<TabBar>中传，而是作为形参让TabBar.tsx在handleClick中再传
  private handleClick = tab => {
    // 直播
    if (tab.id === 0) {
      return;
    } else if (tab.id === -1) {
      // window.location.href = "/live";
      this.props.history.push({
        pathname: "/live"
      });
    } else {
      // window.location.href = "/channel/" + tab.id;
      this.props.history.push({
        pathname: "/channel/" + tab.id
      });
    }
  }

  private handleSwitchClick = () => {
    // .current才能拿到drawerRef绑定的dom节点
    this.drawerRef.current.show();
  }

  // 根据终端类型决定图片后缀
  private getPicUrl(url, format) {
    // 使用this.context来获取共享变量
    const { picURL } = this.context;
    let suffix = ".webp";
    // REACT_ENV在front/config/webpack.config.server.js中
    if (process.env.REACT_ENV === "server") {
      // staticContext就是服务端staicrouter的context
      // 注入入口在/server/index.js
      suffix = this.props.staticContext.picSuffix;
    } else {
      suffix = getPicSuffix();
    }
    // picURL + "?pic=" + url + "@480w_300h.webp"
    // `和$是es6模板字符串，即用占位符的方式拼接字符串
    return `${picURL}?pic=${url}${format + suffix}`;
  }

  /* 以下为生命周期函数 */
  public componentDidMount() {
    // 服务端引入会抛异常
    // swiper是第三发插件
    const Swiper = require("swiper");
    // 需要使用swiper的地方，建一个div，类名为swiper-container
    new Swiper(".swiper-container", {
      loop: true,
      autoplay: 3000,
      autoplayDisableOnInteraction: false,
      pagination: ".swiper-pagination"
    });

    if (this.props.shouldLoad) {
      this.props.dispatch(getIndexContent()).then(() => {
        this.setState({ isDataOk: true });
      });
    } else {
      // 如果不放到定时器里，LoadingCutscene会没来得及加载显示不出来
      setTimeout(() => {
        this.setState({ isDataOk: true });
      }, 1);

      this.props.dispatch(setShouldLoad(true));
    }

    setTimeout(() => {
      // 开发环境中，样式在js加载后动态添加会导致图片被检测到未出现在屏幕上
      // 强制检查懒加载组件是否出现在屏幕上
      forceCheck();
    }, 10);
  }

  /* 以下为渲染部分 */
  public render() {
    const { oneLevelPartitions, additionalVideos, rankingVideos } = this.props;
    const tabBarData = [{ id: 0, name: "首页" } as PartitionType]
      .concat(oneLevelPartitions);
    tabBarData.push(new PartitionType(-1, "直播"));

    const bannerElements = this.props.banners.map(banner => (
      <div className="swiper-slide" key={banner.id}>
        <a href={banner.url}>
          <img
            src={this.getPicUrl(banner.pic, "@480w_300h")}
            width="100%" height="100%"
          />
        </a>
      </div>
    ));

    let videos = rankingVideos;
    // 过滤掉rankingVideos中与additionalVideos重复的
    if (additionalVideos.length > 0) {
      videos = rankingVideos.filter(video => {
        // additionalVideos.findIndex(v => { v.aId === video.aId }) === -1;
        let filter = false;
        for (const v of additionalVideos) {
          if (v.aId === video.aId) {
            filter = true;
          }
        }
        return !filter;
      });
    }
    // 总视频数量多于100，截取掉
    if (videos.length > 100) {
      videos.splice(100);
    }

    let videoElements = videos.map(video => {
      if (video.pic.indexOf("@320w_200h") === -1) {
        video.pic = this.getPicUrl(video.pic, "@320w_200h");
      }
      return <VideoItem
        video={video} key={video.aId} showStatistics={true} lazyOffset={1000}
      />
    });
    if (additionalVideos.length > 0) {
      const additionalVideoElements = this.props.additionalVideos.map(video => {
        if (video.pic.indexOf("@320w_200h") === -1) {
          video.pic = this.getPicUrl(video.pic, "@320w_200h");
        }
        return <VideoItem
          video={video} key={video.aId} showStatistics={false} lazyOffset={1000}
        />
      });

      videoElements = videoElements.concat(additionalVideoElements);
    }

    return (
      <div className="index">
        {
          !this.state.isDataOk ? <LoadingCutscene /> :
            <>
              <div className={style.topWrapper}>
                {/* 顶部工具栏 */}
                <Header />
                <div className={style.partition}>
                  {/* tabbar */}
                  <div className={style.tabBar}>
                    <TabBar data={tabBarData} type={"indicate"} clickMethod={this.handleClick} />
                  </div>
                  {/* 打开抽屉箭头 */}
                  <div className={style.switch} onClick={this.handleSwitchClick}>
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-arrowDownBig"></use>
                    </svg>
                  </div>
                </div>
                {/* 抽屉 */}
                <div className={style.drawerPosition}>
                  {/* data是自定义属性，会作为props传递给子组件Drawer */}
                  <Drawer data={tabBarData} ref={this.drawerRef} onClick={this.handleClick} />
                </div>
              </div>
              <div className={style.contentWrapper}>
                {/* 轮播图 */}
                {
                  this.props.banners.length > 0 &&
                  <div className={style.bannerSlider}>
                    <div className="swiper-container">
                      <div className="swiper-wrapper">
                        {bannerElements}
                      </div>
                      <div className="swiper-pagination-wrapper">
                        <div className="swiper-pagination clear" />
                      </div>
                    </div>
                  </div>
                }
                {/* 视频 */}
                <div className={style.videoList + " clear"}>
                  {videoElements}
                </div>
              </div>
              <ScrollToTop />
            </>
        }

      </div>
    );
  }
}

// contextType的作用是不使用Consumer也能使用Context Provider中的共享变量
Index.contextType = Context;

export default Index;
