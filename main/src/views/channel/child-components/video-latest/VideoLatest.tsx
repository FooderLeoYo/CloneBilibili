import * as React from "react";

import { getRankingArchive } from "../../../../api/ranking";

import VideoItem from "../../../../components/video-item/VideoItem";

import { Video, createVideoByLatest } from "../../../../class-object-creators";

import style from "./video-latest.styl?css-modules";
import tips from "../../../../assets/images/tips.png";

interface VideoLatestProps {
  id: number,
  curLvTwoTabIndex: number,
  getPicUrl: (url: string, format: string) => string
}

interface VideoLatestState {
  id: number,
  currentPage: number,
  latestVideos: Video[],
  loading: boolean
}

class VideoLatest extends React.Component<VideoLatestProps, VideoLatestState> {
  private loadMoreRef: React.RefObject<HTMLDivElement> = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      id: -99,
      currentPage: 1,
      latestVideos: [],
      loading: false
    }
  }

  private loadLatestData(id, p) {
    this.setState({ loading: true });

    getRankingArchive({ tId: id, p }).then(result => {
      if (result.code === "1") {
        const latestVideos = result.data.archives.map(data =>
          createVideoByLatest(data)
        );
        this.setState({
          currentPage: p,
          latestVideos: this.state.latestVideos.concat(latestVideos),
          loading: false
        });
      }
    });
  }

  private handleClick() {
    const currentPage = this.state.currentPage + 1;
    if (currentPage <= 4) { this.loadLatestData(this.props.id, currentPage); }
  }

  public componentDidMount() {
    this.loadMoreRef.current.addEventListener("click", () => {
      this.handleClick()
    });

    if (this.props.curLvTwoTabIndex !== 0) {
      this.loadLatestData(this.props.id, 1);
    }
  }

  public static getDerivedStateFromProps(props, state) {
    if (props.id !== state.id) {
      return {
        id: props.id,
        latestVideos: []
      };
    }
    return null;
  }

  public componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
      this.loadLatestData(this.props.id, 1);
    }
  }

  public render() {
    return (
      <div className={style.videoLatest}>
        <div className={style.title}>最新视频</div>
        <div className={style.videoList + " clear"}>
          {
            this.state.latestVideos.map((item, i) => {
              if (item.pic && item.pic.indexOf("@320w_200h") === -1) {
                item.pic = this.props.getPicUrl(item.pic, "@320w_200h");
              }
              return <VideoItem video={item} key={i} showStatistics={true} lazyOffset={100} />
            })
          }
        </div>
        { // 拉到底部可加载更多，但最多只加载4页视频数据
          this.state.currentPage < 4 ? (
            this.state.loading ? <div className={style.loading}>Loading...</div> :
              <div className={style.loadMore} ref={this.loadMoreRef}>点击加载更多</div>) :
            (
              <div className={style.tips}>
                <img src={tips} />
                <span className={style.text}>只能到这里了 ~</span>
              </div>
            )
        }
      </div>
    );
  }
}

export default VideoLatest;
