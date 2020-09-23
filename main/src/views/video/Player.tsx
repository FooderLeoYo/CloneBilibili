import * as React from "react";
import * as Hls from "hls.js";

import Context from "../../context";
import { getBarrages } from "../../api/video";

import Barrage, { BarrageType } from "./Barrage";
import { formatDuration } from "../../customed-methods/string";

import loading from "../../assets/images/loading.svg";
import style from "./stylus/player.styl?css-modules";

interface PlayerProps {
  live: boolean;
  isLive?: boolean;
  liveTime?: number;
  video: {
    aId: number,
    cId: number,
    title: string,
    cover: string,
    duration: number,
    url: string
  };
}

interface PlayerState {
  duration: number;
  paused: boolean;
  waiting: boolean;
  barrageSwitch: boolean;
  fullscreen: boolean;
  finish: boolean;
  isShowCover: boolean;
  isShowControlBar: boolean;
  isShowPlayBtn: boolean;
  isLive: boolean;
  isShowSpeedBar: boolean;
}

class Player extends React.PureComponent<PlayerProps, PlayerState> {
  /* 以下为初始化 */
  private wrapperRef: React.RefObject<HTMLDivElement>;
  private videoRef: React.RefObject<HTMLVideoElement>;
  private videoAreaRef: React.RefObject<HTMLDivElement>;
  private barrageRef: React.RefObject<Barrage>;
  private controlBarRef: React.RefObject<HTMLDivElement>;
  private currentTimeRef: React.RefObject<HTMLSpanElement>;
  private progressRef: React.RefObject<HTMLDivElement>;
  private liveDurationRef: React.RefObject<HTMLDivElement>;
  private progressBtnRef: React.RefObject<HTMLDivElement>;
  private initBarrages: Array<any>; // 拿到数据时的初始格式，供slice后生成barrages
  private barrages: Array<any>; // 真正发送到播放器中的弹幕
  private ctrBarTimer: number; // 控制鼠标静止一段时间后隐藏控制条的定时器
  private playBtnTimer: number;
  private isPC: boolean;
  public static defaultProps = {
    live: false, // 该视频是否是直播
    isLive: false, // 主播是否正在直播
    liveTime: 0
  };
  constructor(props) {
    super(props);
    this.wrapperRef = React.createRef();
    this.videoRef = React.createRef();
    this.videoAreaRef = React.createRef();
    this.barrageRef = React.createRef();
    this.controlBarRef = React.createRef();
    this.currentTimeRef = React.createRef();
    this.progressRef = React.createRef();
    this.liveDurationRef = React.createRef();
    this.progressBtnRef = React.createRef();
    this.isPC = !(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i) !== null);
    this.state = {
      duration: 0,
      paused: true,
      waiting: false,
      barrageSwitch: true,
      fullscreen: false,
      finish: false,
      isShowCover: true,
      isShowControlBar: true,
      isShowPlayBtn: true,
      isLive: props.isLive,
      isShowSpeedBar: false
    };
  }

  /* 以下为自定义方法 */
  private setTimeupdateLis = () => {
    const videoDOM = this.videoRef.current;
    const barrageComponent = this.barrageRef.current;
    const currentTimeDOM = this.currentTimeRef.current;
    const progressDOM = this.progressRef.current;

    // 初始化时设置duration
    if (this.state.duration === 0) {
      this.setState({ duration: videoDOM.duration });
    }

    // 更新进度条
    currentTimeDOM.innerHTML = formatDuration(videoDOM.currentTime, "0#:##");
    const progress = videoDOM.currentTime / videoDOM.duration * 100;
    progressDOM.style.width = `${progress}%`;

    // 加载当前时点的弹幕
    if (this.state.barrageSwitch) {
      const barrages = this.findBarrages(videoDOM.currentTime);
      // 发送弹幕
      barrages.forEach(barrage => {
        barrageComponent.send(barrage);
      });
    }
  }

  private setVideoDOMListner = () => {
    const videoDOM = this.videoRef.current;
    const barrageComponent = this.barrageRef.current;
    const currentTimeDOM = this.currentTimeRef.current;
    const progressDOM = this.progressRef.current;

    // 当播放时间发生变动时，更新进度条并加载当前时点的弹幕
    videoDOM.addEventListener("timeupdate", this.setTimeupdateLis);

    // 视频结束时重置进度条和state
    videoDOM.addEventListener("ended", () => {
      currentTimeDOM.innerHTML = "00:00";
      progressDOM.style.width = "0";
      this.setState({
        paused: true,
        finish: true
      });
      // 重新赋值弹幕列表
      this.barrages = this.initBarrages.slice();
      // 清除弹幕
      barrageComponent.clear();
    });
  }

  private setProgressDOM = () => {
    const videoDOM = this.videoRef.current;
    const progressDOM = this.progressRef.current;
    const progressWrapperDOM = progressDOM.parentElement;
    const progressBtnDOM = this.progressBtnRef.current;
    const currentTimeDOM = this.currentTimeRef.current;


    let width = progressWrapperDOM.offsetWidth; // 进度条总宽度
    let left = progressWrapperDOM.getBoundingClientRect().left; // 进度条框距离视口左边距离
    let rate = -1; // 拖拽进度比例

    // 触碰进度条时，设置width和left
    progressBtnDOM.addEventListener("touchstart", e => {
      // e.stopPropagation();
      clearTimeout(this.ctrBarTimer);
      videoDOM.removeEventListener("timeupdate", this.setTimeupdateLis);
    });

    progressBtnDOM.addEventListener("touchmove", e => {
      e.preventDefault(); // 阻止屏幕被拖动
      const touch = e.touches[0];

      // 计算拖拽进度比例
      rate = (touch.clientX - left) / width;
      // 手指点在进度条以外
      if (rate > 1) {
        rate = 1;
      } else if (rate < 0) {
        rate = 0;
      }

      const currentTime = videoDOM.duration * rate;
      progressDOM.style.width = `${rate * 100}%`;
      currentTimeDOM.innerHTML = formatDuration(currentTime, "0#:##");
    });

    progressBtnDOM.addEventListener("touchend", e => {
      const touch = e.changedTouches[0];
      // if (rate < 0) { // 如果没触发过touchmove
      //   rate = (touch.clientX - left) / width;
      //   if (rate > 1) {
      //     rate = 1;
      //   } else if (rate < 0) {
      //     rate = 0;
      //   }
      // }
      videoDOM.currentTime = videoDOM.duration * rate;
      videoDOM.addEventListener("timeupdate", this.setTimeupdateLis);
      this.showControlsTemporally();
      // rate = -1;
    });
  }

  private setLiveDurationDOM = () => {
    const liveDurationDOM = this.liveDurationRef.current;
    let liveDuration = (new Date().getTime() - this.props.liveTime) / 1000;
    liveDurationDOM.innerHTML = formatDuration(liveDuration, "0#:##:##");
    setInterval(() => {
      liveDuration += 1;
      liveDurationDOM.innerHTML = formatDuration(liveDuration, "0#:##:##");
    }, 1000);
  }

  private setLiveVideoDOM = () => {
    const videoDOM = this.videoRef.current;
    const { video } = this.props;

    // 支持m3u8，直接使用video播放
    if (videoDOM.canPlayType("application/vnd.apple.mpegurl")) {
      videoDOM.src = video.url;
      videoDOM.addEventListener("canplay", () => {
        videoDOM.play();
      });
      videoDOM.addEventListener("error", () => {
        this.setState({
          isLive: false
        });
      });
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(video.url);
      hls.attachMedia(videoDOM);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoDOM.play();
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR ||
            data.response.code === 404) {
            this.setState({
              isLive: false
            });
          }
        }
      });
    }
  }

  private initVideo() {
    const { live } = this.props;

    if (!live) { // 非直播时处理
      this.getBarrages();
      this.setVideoDOMListner();
      this.setProgressDOM();
    } else { // 直播时处理
      if (this.props.liveTime) {
        this.setLiveDurationDOM();
      }
      this.setLiveVideoDOM();
    }
  }

  public sendBarrage(data: { color: string, content: string }) {
    if (this.state.barrageSwitch) {
      this.barrageRef.current.send({
        type: BarrageType.RANDOM,
        color: data.color,
        content: data.content
      });
    }
  }

  private getBarrages() {
    getBarrages(this.props.video.cId).then(result => {
      const barrages = [];
      if (result.code === "1") {
        result.data.forEach(data => {
          barrages.push({
            type: data.type === "1" ? BarrageType.RANDOM : BarrageType.FIXED,
            color: "#" + Number(data.decimalColor).toString(16),
            content: data.content,
            time: Number(data.time)
          });
        });
      }

      // 初始化弹幕列表
      this.initBarrages = barrages;
      this.barrages = this.initBarrages.slice();
    });
  }

  //  根据时间查找弹幕
  private findBarrages(time) {
    // 查找到的弹幕
    const barrages = [];
    // 查找到的弹幕索引
    const indexs = [];
    this.barrages.forEach((barrage, index) => {
      // 换成整数秒
      if (parseInt(barrage.time, 10) === parseInt(time, 10)) {
        barrages.push(barrage);
        indexs.push(index);
      }
    });
    // 从this.barrages中删掉已经查找到的time时点的弹幕
    // 这样视频继续播放或移动播放位置触发findBarrages时，this.barrages.forEach的范围
    // 会缩小，搜索速度会加快
    indexs.forEach((index, i) => {
      // 从前往后删除，删掉前面的以后，后面的索引就变小了，因此要index - i
      this.barrages.splice(index - i, 1);
    });
    return barrages;
  }

  private playOrPause() {
    const videoDOM = this.videoRef.current;

    if (this.state.paused) {
      videoDOM.play();
      this.showControlsTemporally();
      this.playBtnTimer = setTimeout(() => {
        this.setState({ isShowPlayBtn: false })
      }, 800);
      this.setState({
        paused: false,
        finish: false,
      });
    } else {
      videoDOM.pause();
      clearTimeout(this.ctrBarTimer);
      clearTimeout(this.playBtnTimer);
      this.setState({
        paused: true,
        isShowPlayBtn: true
      });
    }
  }

  private showControlsTemporally() {
    clearTimeout(this.ctrBarTimer);

    if (!this.state.isShowControlBar) {
      this.setState({ isShowControlBar: true });
    }
    this.ctrBarTimer = setTimeout(() => {
      this.hideControls();
    }, 3000);
  }

  private showControls() {
    this.setState({ isShowControlBar: true });
  }

  private hideControls() {
    if (this.state.isShowControlBar) {
      this.setState({ isShowControlBar: false });
    }
  }

  private changePlayPosition(e) {
    const progressWrapperDOM = e.currentTarget;
    const left = progressWrapperDOM.getBoundingClientRect().left;
    const progress = (e.clientX - left) / progressWrapperDOM.offsetWidth;
    const videoDOM = this.videoRef.current;

    videoDOM.currentTime = videoDOM.duration * progress;
    // 重新赋值弹幕列表
    this.barrages = this.initBarrages.slice();
    // 清除跳转前的弹幕
    this.barrageRef.current.clear();
  }

  // 开启或关闭弹幕
  private onOrOff() {
    if (this.state.barrageSwitch) {
      this.barrageRef.current.clear();
      this.setState({ barrageSwitch: false });
    } else {
      this.setState({ barrageSwitch: true });
    }
  }

  private entryOrExitFullscreen() {
    if (this.state.fullscreen) {
      this.setState({ fullscreen: false });
      const doc: any = document;
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.webkitCancelFullScreen) {
        doc.webkitCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    } else {
      this.setState({ fullscreen: true });
      // 这里调用全屏的是包裹<video>的外层div
      // 因为如果直接让<video>全屏，则视频控制器会变成浏览器自带的
      const wrapperDOM: any = this.wrapperRef.current;
      if (wrapperDOM.requestFullscreen) {
        wrapperDOM.requestFullscreen();
      } else if (wrapperDOM.mozRequestFullScreen) {
        wrapperDOM.mozRequestFullScreen();
      } else if (wrapperDOM.webkitRequestFullScreen) {
        wrapperDOM.webkitRequestFullScreen();
      } else if (wrapperDOM.msRequestFullscreen) {
        wrapperDOM.msRequestFullscreen();
      }
    }
  }

  private getVideoUrl(url) {
    const { videoURL } = this.context;
    // 对url统一编码为utf-8的格式到后台
    // 不加encodeURI的话，默认浏览器编码格式提交；浏览器不同时，传到后台的值也就不同了
    url = encodeURIComponent(url);
    // 拼接播放源地址
    return `${videoURL}?video=${url}`;
  }

  private setPlayingState = () => {
    const videoDOM = this.videoRef.current;
    const setPlayState = () => {
      this.setState({
        isShowCover: false,
        paused: false,
        waiting: false
      });
    }

    // "play"是HTML DOM 事件onplay的事件类型，而不是一个自定义名称
    videoDOM.addEventListener("play", setPlayState);
    videoDOM.addEventListener("playing", setPlayState);
    videoDOM.addEventListener("waiting", () => {
      this.setState({ waiting: true });
    });
  }

  private setMouseListener = () => {
    const videoAreaDOM = this.videoAreaRef.current;
    const controlBarDOM = this.controlBarRef.current;
    // click事件不能正常显示/隐藏控制器，且会影响其他控制器子组件的点击
    // videoAreaDOM.addEventListener("click", (e) => {
    //   e.stopPropagation();
    //   e.preventDefault();
    //   clearTimeout(this.timer);
    //   if (!this.state.isShowControlBar) {
    //     this.showControlsTemporally();
    //   } else {
    //     this.hideControls();
    //   }
    // });

    // 鼠标移入视频区则显示控制器，2秒后隐藏
    videoAreaDOM.addEventListener("mouseover", e => {
      e.stopPropagation();
      this.showControlsTemporally();
    });
    // 鼠标移动过程中一直显示控制器
    videoAreaDOM.addEventListener("mousemove", e => {
      e.stopPropagation();
      clearTimeout(this.ctrBarTimer);
      this.showControlsTemporally();
    });
    // 鼠标移出视频区立即隐藏控制器
    videoAreaDOM.addEventListener("mouseout", e => {
      e.stopPropagation();
      clearTimeout(this.ctrBarTimer);
      this.hideControls();
    });
    // 鼠标停留在控制器上时，一直显示控制器
    // 这里不绑定mouseover事件，是因为：
    //   触发mouseover后马上又触发videoAreaDOM的mousemove，进而调用showControlsTemporally
    //   这样控制器就会2秒后隐藏，而不是一直显示
    controlBarDOM.addEventListener("mousemove", e => {
      e.stopPropagation();
      clearTimeout(this.ctrBarTimer);
      this.showControls();
    });
  }

  private setFingerListener = () => {
    const videoAreaDOM = this.videoAreaRef.current;
    // 这里的事件不能用click，只能touchstart，否则playOrPause方法失效
    videoAreaDOM.addEventListener("touchstart", e => {
      e.stopPropagation();
      this.showControlsTemporally();
    });
  }

  private showOrHideSpeedBar = () => {
    if (this.state.isShowSpeedBar) {
      this.setState({ isShowSpeedBar: false });
    } else {
      this.setState({ isShowSpeedBar: true });
    }
  }

  private setPlaySpeed = () => {
    // .playbackRate = 
  }

  /* 以下为生命周期函数 */
  public componentDidMount() {
    if (this.isPC) {
      this.setMouseListener();
    } else {
      this.setFingerListener();
    }
    this.setPlayingState();
    this.initVideo();
  }

  /* 以下为渲染部分 */
  public render() {
    const { live, video } = this.props;
    const videoStyle = { display: this.state.isShowCover ? "none" : "block" };
    const coverStyle = { display: this.state.isShowCover ? "block" : "none" };
    const controlBarStyle = { display: this.state.isShowControlBar ? "block" : "none" };
    const playBtnStyle = { display: this.state.isShowPlayBtn ? "block" : "none" };
    const speedBarStyle = { display: this.state.isShowSpeedBar ? "block" : "none" };
    const playBtnClass = this.state.paused ? style.play : style.pause;
    const switchClass = this.state.barrageSwitch ? style.barrageOn : style.barrageOff;

    return (
      <div className={style.videoPlayer} ref={this.wrapperRef}>
        {/* 视频区域 */}
        <video
          height="100%"
          width="100%"
          preload="auto"
          // playsinline是解决ios默认打开网页的时候，会自动全屏播放
          x5-playsinline="true"
          webkit-playsinline="true"
          playsInline={true}
          src={live ? "" : this.getVideoUrl(video.url)}
          style={videoStyle}
          ref={this.videoRef}
        />
        {/* 弹幕 */}
        {/* 不把Barrage放进videoArea中是因为： */}
        {/*   如果Barrage成为videoArea的子元素，那么Barrage的事件会冒泡到videoArea */}
        {/*   这样就还要阻止Barrage的事件冒泡，所以不如将其放在外面 */}
        <div className={style.barrage}>
          <Barrage opacity={live ? 1 : 0.75} ref={this.barrageRef} />
        </div>
        <div className={style.videoArea} ref={this.videoAreaRef}>
          {/* 右边的白色播放暂停按钮 */}
          <div
            className={style.playButton + " " + playBtnClass}
            style={playBtnStyle}
            onClick={e => {
              e.stopPropagation(); // 阻止点击冒泡到controls
              this.playOrPause();
            }}
          />
          {/* 控制栏 */}
          <div
            className={style.controlBar + (live ? " " + style.liveControl : "")}
            style={controlBarStyle}
            ref={this.controlBarRef}
          >
            {/* 控制栏播放按钮 */}
            <div
              className={style.controlBarPlayBtn + " " + playBtnClass}
              onClick={e => {
                e.stopPropagation();
                this.playOrPause();
              }}
            >
            </div>
            {
              !live ? (
                // React.Fragment和空的div类似，都是在最外层起到包裹的作用
                // 区别是React.Fragment不会真实的html元素，这样就减轻了浏览器渲染压力
                <React.Fragment>
                  {/* 当前时间、视频总时长 */}
                  <div className={style.left}>
                    <span className={style.time} ref={this.currentTimeRef}>00:00</span>
                    <span className={style.split}>/</span>
                    <span className={style.totalDuration}>
                      {formatDuration(this.state.duration, "0#:##")}
                    </span>
                  </div>
                  {/* 进度条 */}
                  <div className={style.center}>
                    <div
                      className={style.progressWrapper}
                      onClick={e => { this.changePlayPosition(e); }}
                    >
                      <div className={style.progress} ref={this.progressRef} >
                        <span className={style.progressBtn} ref={this.progressBtnRef} />
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ) : ( // 直播时为直播时长
                  <div className={style.left} ref={this.liveDurationRef}></div>
                )
            }
            <div className={style.right}>
              <div
                className={style.speedBtn}
                onClick={e => {
                  e.stopPropagation();
                  this.showOrHideSpeedBar();
                }}
              />
              <div
                className={style.speedBar}
                style={speedBarStyle}
                onClick={e => {
                  e.stopPropagation();
                  this.setPlaySpeed();
                }}
              >
                <ul>
                  {
                    for(let i = 0; i < 5; i++) {

                  }
                  }
                  <li>2</li>
                  <li>1.5</li>
                  <li>1</li>
                  <li>0.75</li>
                  <li>0.5</li>
                </ul>
              </div >
              {/* 弹幕开关 */}
              <div
                className={switchClass}
                onClick={e => {
                  e.stopPropagation();
                  this.onOrOff();
                }}
              />
              {/* 全屏开关 */}
              <div
                className={style.fullscreen}
                onClick={e => {
                  e.stopPropagation();
                  this.entryOrExitFullscreen();
                }}
              />
            </div>
          </div>
        </div>
        {/* 封面 */}
        <div className={style.cover} style={coverStyle}>
          {
            !live ? (
              <React.Fragment>
                <div className={style.title}>
                  av{video.aId}
                </div>
                <img className={style.pic} src={video.cover} alt={video.title} />
                <div className={style.prePlay}>
                  <div className={style.duration}>
                    {formatDuration(video.duration, "0#:##:##")}
                  </div>
                  <div
                    className={style.preview}
                    onClick={() => { this.playOrPause(); }}
                  />
                </div>
              </React.Fragment>
            ) : (
                <React.Fragment>
                  <img className={style.pic} src={video.cover} alt={video.title} />
                  <div className={style.prePlay}>
                    <div
                      className={style.preview}
                      onClick={() => { this.playOrPause(); }}
                    />
                  </div>
                </React.Fragment>
              )
          }
        </div>
        {  // 正在缓冲
          this.state.waiting ? (
            <div className={style.loading}>
              <div className={style.wrapper}>
                <img className={style.img} src={loading} />
                <span className={style.text}>
                  {!live ? "正在缓冲" : ""}
                </span>
              </div>
            </div>
          ) : null
        }
        { // 重新播放
          this.state.finish ? (
            <div className={style.finishCover}>
              <img className={style.coverPic} src={video.cover} alt={video.title} />
              <div className={style.coverWrapper}>
                <div
                  className={style.replay}
                  onClick={() => { this.playOrPause(); }}
                >
                  <i className={style.replayIcon} />
                  <span>重新播放</span>
                </div>
              </div>
            </div>
          ) : null
        }
        { // 直播时，主播不在
          live && !this.state.isLive ? (
            <div className={style.noticeCover}>
              <div className={style.noticeWrapper}>
                <i />
                <span>闲置中...</span>
              </div>
            </div>
          ) : null
        }
      </div>
    );
  }
}

Player.contextType = Context;

export default Player;