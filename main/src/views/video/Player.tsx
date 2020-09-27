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
  paused: boolean;
  waiting: boolean;
  barrageSwitch: boolean;
  isFullscreen: boolean;
  finish: boolean;
  isShowCover: boolean;
  isShowControlBar: boolean;
  isShowPlayBtn: boolean;
  isLive: boolean;
  isShowSpeedBar: boolean;
  isShowCenterSpeed: boolean;
}

class Player extends React.PureComponent<PlayerProps, PlayerState> {
  /* 以下为初始化 */
  private wrapperRef: React.RefObject<HTMLDivElement>;
  private videoRef: React.RefObject<HTMLVideoElement>;
  private videoAreaRef: React.RefObject<HTMLDivElement>;
  private barrageContainerRef: React.RefObject<HTMLDivElement>;
  private barrageRef: React.RefObject<Barrage>;
  private controlBarRef: React.RefObject<HTMLDivElement>;
  private currentTimeRef: React.RefObject<HTMLSpanElement>;
  private progressRef: React.RefObject<HTMLDivElement>;
  private liveDurationRef: React.RefObject<HTMLDivElement>;
  private progressBtnRef: React.RefObject<HTMLDivElement>;
  private ctrPlayBtnRef: React.RefObject<HTMLDivElement>;
  private speedBarRef: React.RefObject<HTMLUListElement>;

  private duration: number;
  private initBarrages: Array<any>; // 拿到数据时的初始格式，供slice后生成barrages
  private barrages: Array<any>; // 真正发送到播放器中的弹幕
  private ctrBarTimer: number; // 控制鼠标静止一段时间后隐藏控制条的定时器
  private easeTimer: number;
  private playBtnTimer: number;
  private isPC: boolean;
  private centerPlaySpeed: number;
  private btnPlaySpeed: string;

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
    this.barrageContainerRef = React.createRef();
    this.barrageRef = React.createRef();
    this.controlBarRef = React.createRef();
    this.currentTimeRef = React.createRef();
    this.progressRef = React.createRef();
    this.liveDurationRef = React.createRef();
    this.progressBtnRef = React.createRef();
    this.ctrPlayBtnRef = React.createRef();
    this.speedBarRef = React.createRef();
    this.duration = 0;
    this.isPC = !(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i) !== null);
    this.centerPlaySpeed = 1;
    this.btnPlaySpeed = "1";

    this.state = {
      paused: true,
      waiting: false,
      barrageSwitch: true,
      isFullscreen: false,
      finish: false,
      isShowCover: true,
      isShowControlBar: true,
      isShowPlayBtn: true,
      isLive: props.isLive,
      isShowSpeedBar: false,
      isShowCenterSpeed: false
    };
  }

  /* 以下为自定义方法 */

  /* videoDOM相关 */
  private getVideoUrl(url) {
    const { videoURL } = this.context;
    // 对url统一编码为utf-8的格式到后台
    // 不加encodeURI的话，默认浏览器编码格式提交；浏览器不同时，传到后台的值也就不同了
    url = encodeURIComponent(url);
    // 拼接播放源地址
    return `${videoURL}?video=${url}`;
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
      this.showControlsTemporally();
      clearTimeout(this.playBtnTimer);
      this.setState({
        paused: true,
        isShowPlayBtn: true
      });
    }
  }

  private setThumbnailListener = () => {
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

  private setVideoDOMListener = () => {
    const videoDOM = this.videoRef.current;
    const barrageComponent = this.barrageRef.current;
    const currentTimeDOM = this.currentTimeRef.current;
    const progressDOM = this.progressRef.current;

    // 当播放时间发生变动时，更新进度条并加载当前时点的弹幕
    videoDOM.addEventListener("timeupdate", this.setTimeupdateListener);

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


  /* 弹幕相关 */
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

  public sendBarrage(data: { color: string, content: string }) {
    if (this.state.barrageSwitch) {
      this.barrageRef.current.send({
        type: BarrageType.RANDOM,
        color: data.color,
        content: data.content
      });
    }
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


  /* 控制栏相关 */

  /* 控制栏整体相关 */
  private setGraduallyHide = (DOM, startTime) => {
    this.easeTimer = setTimeout(() => {
      DOM.classList.add(style.graduallyHide);
    }, startTime);
    setTimeout(() => {
      DOM.classList.remove(style.graduallyHide);
    }, startTime + 500);
  }

  private showControlsTemporally = () => {
    const controlBarDOM = this.controlBarRef.current;
    clearTimeout(this.ctrBarTimer);
    clearTimeout(this.easeTimer);

    this.setState({ isShowControlBar: true });
    this.setGraduallyHide(controlBarDOM, 2000);
    this.ctrBarTimer = setTimeout(() => {
      this.setState({ isShowControlBar: false });
    }, 2500);
  }

  private showOrHideControls = () => {
    if (this.state.isShowControlBar) {
      this.setState({ isShowControlBar: false });
    } else {
      if (this.ctrBarTimer != 0) {
        this.showControlsTemporally();
      }
    }
  }

  private setFingerListener = () => {
    const videoAreaDOM = this.videoAreaRef.current;
    const barrageContainerDOM = this.barrageContainerRef.current;

    barrageContainerDOM.addEventListener("touchend", e => {
      e.stopPropagation();
      this.showOrHideControls();
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
      this.setState({ isShowControlBar: false });
    });
    // 鼠标停留在控制器上时，一直显示控制器
    // 这里不绑定mouseover事件，是因为：
    //   触发mouseover后马上又触发videoAreaDOM的mousemove，进而调用showControlsTemporally
    //   这样控制器就会2秒后隐藏，而不是一直显示
    controlBarDOM.addEventListener("mousemove", e => {
      e.stopPropagation();
      clearTimeout(this.ctrBarTimer);
      this.showControlsTemporally();
    });
  }

  /* 进度条相关 */
  private setTimeupdateListener = () => {
    const videoDOM = this.videoRef.current;
    const barrageComponent = this.barrageRef.current;
    const currentTimeDOM = this.currentTimeRef.current;
    const progressDOM = this.progressRef.current;

    // 初始化时设置duration
    if (this.duration === 0) {
      this.duration = videoDOM.duration;
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
      e.stopPropagation();
      clearTimeout(this.ctrBarTimer);
      videoDOM.removeEventListener("timeupdate", this.setTimeupdateListener);
    });

    progressBtnDOM.addEventListener("touchmove", e => {
      e.stopPropagation();
      e.preventDefault(); // 阻止屏幕被拖动
      this.controlBarRef.current.classList.remove(style.graduallyHide);
      clearTimeout(this.ctrBarTimer);
      clearTimeout(this.easeTimer);
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
      e.stopPropagation();
      const touch = e.changedTouches[0];
      videoDOM.currentTime = videoDOM.duration * rate;
      videoDOM.addEventListener("timeupdate", this.setTimeupdateListener);
      this.showControlsTemporally();
    });
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

  private setLiveDurationDOM = () => {
    const liveDurationDOM = this.liveDurationRef.current;
    let liveDuration = (new Date().getTime() - this.props.liveTime) / 1000;
    liveDurationDOM.innerHTML = formatDuration(liveDuration, "0#:##:##");
    setInterval(() => {
      liveDuration += 1;
      liveDurationDOM.innerHTML = formatDuration(liveDuration, "0#:##:##");
    }, 1000);
  }

  /* 播放速度相关 */
  private setPlaySpeed = speed => {
    const videoDOM = this.videoRef.current;

    videoDOM.playbackRate = speed;

    this.centerPlaySpeed = speed;
    this.setState({ isShowCenterSpeed: true });
    if (this.state.paused) {
      this.showPlayBtn();
    }
    setTimeout(() => {
      this.setState({ isShowCenterSpeed: false });
    }, 1000);

    // playSpeed不能直接用speed，因为如果是数字当有小数点的时候
    // 将playSpeed拼接到speedBtnPicClass做类名时就会报错
    switch (speed) {
      case 0.5:
        this.btnPlaySpeed = "Point5";
        break;
      case 0.75:
        this.btnPlaySpeed = "Point75";
        break;
      case 1:
        this.btnPlaySpeed = "1";
        break;
      case 1.5:
        this.btnPlaySpeed = "1Point5";
        break;
      case 2:
        this.btnPlaySpeed = "2";
        break;
    }
  }

  private showSpeedBarTemporally = () => {
    const speedBarDOM = this.speedBarRef.current;
    clearTimeout(this.easeTimer);

    this.setState({ isShowSpeedBar: true });
    this.setGraduallyHide(speedBarDOM, 2000);
    setTimeout(() => {
      this.setState({ isShowSpeedBar: false });
    }, 2500);
  }

  /* 控制栏其他按钮相关 */
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
    if (this.state.isFullscreen) {
      this.setState({ isFullscreen: false });
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
      this.setState({ isFullscreen: true });
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

  private showPlayBtn = () => {
    if (this.playBtnTimer != 0) {
      clearTimeout(this.playBtnTimer);
    }

    if (!this.state.isShowPlayBtn) {
      this.setState({ isShowPlayBtn: true });
    }
  }

  /* 以下为生命周期函数 */
  public componentDidMount() {
    const { live } = this.props;

    this.setThumbnailListener();

    // 设置点击相关监听器
    if (this.isPC) {
      this.setMouseListener();
    } else {
      this.setFingerListener();
    }

    if (!live) { // 非直播时处理
      this.getBarrages();
      this.setVideoDOMListener();
      this.setProgressDOM();
    } else { // 直播时处理
      if (this.props.liveTime) {
        this.setLiveDurationDOM();
      }
      this.setLiveVideoDOM();
    }
  }

  /* 以下为渲染部分 */
  public render() {
    const { live, video } = this.props;
    const videoCoverStyle = { display: this.state.isShowCover ? "none" : "block" };
    const coverStyle = { display: this.state.isShowCover ? "block" : "none" };
    const controlBarStyle = { display: this.state.isShowControlBar ? "block" : "none" };
    const playBtnStyle = { display: this.state.isShowPlayBtn ? "block" : "none" };
    // 注意这里设置显示不能是block，因为会覆盖掉css中的grid
    // 所以直接设成grid，css还可以省去display: grid
    const speedBarStyle = { display: this.state.isShowSpeedBar ? "grid" : "none" };
    const centerSpeedStyle = { display: this.state.isShowCenterSpeed ? "block" : "none" };
    const speedBtnPicClass = style[`speed${this.btnPlaySpeed}`];
    const playBtnClass = this.state.paused ? style.play : style.pause;
    const switchClass = this.state.barrageSwitch ? style.barrageOn : style.barrageOff;
    const generateLi = () => {
      let liArr = [];

      for (let i = 0; i < 4; i++) {
        const speed = (i + 1) * 0.5;
        liArr.push(
          <li
            onClick={e => {
              e.stopPropagation();
              this.setPlaySpeed(speed);
              this.setState({ isShowSpeedBar: false });
            }}
            key={speed}
          >{speed}</li>
        );
      }
      liArr.splice(1, 0, <li
        onClick={e => {
          e.stopPropagation();
          this.setPlaySpeed(0.75);
          this.setState({ isShowSpeedBar: false });
        }}
        key={0.75}
      >{0.75}</li>);

      return liArr;
    }
    const liElements = generateLi();

    return (
      <div className={style.videoPlayer} ref={this.wrapperRef}>
        {/* 视频区域 */}

        <div className={style.videoArea} ref={this.videoAreaRef}>
          {/* 播放速度选择及当前所选速度 */}
          <video
            height="100%"
            width="100%"
            preload="auto"
            // playsinline是解决ios默认打开网页的时候，会自动全屏播放
            x5-playsinline="true"
            webkit-playsinline="true"
            playsInline={true}
            src={live ? "" : this.getVideoUrl(video.url)}
            style={videoCoverStyle}
            ref={this.videoRef}
          />
        </div>
        {/* 弹幕 */}
        {/* 不把Barrage放进videoArea中是因为： */}
        {/*   如果Barrage成为videoArea的子元素，那么Barrage的事件会冒泡到videoArea */}
        {/*   这样就还要阻止Barrage的事件冒泡，所以不如将其放在外面 */}
        <div className={style.barrage} ref={this.barrageContainerRef}>
          <Barrage opacity={live ? 1 : 0.75} ref={this.barrageRef} />
        </div>
        <div className={style.controlContainer}>
          {/* 速度调节及显示 */}
          <div className={style.speedContainer}>
            <span
              className={style.centerSpeed}
              style={centerSpeedStyle}
            >{`${this.centerPlaySpeed}x`}
            </span>
            <ul
              className={style.speedBar} style={speedBarStyle} ref={this.speedBarRef}
            >
              {liElements}
            </ul>
          </div>
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
              ref={this.ctrPlayBtnRef}
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
                      {formatDuration(this.duration, "0#:##")}
                    </span>
                  </div>
                  {/* 进度条 */}
                  <div className={style.center}>
                    <div
                      className={style.progressWrapper}
                      onClick={e => {
                        e.stopPropagation();
                        this.changePlayPosition(e);
                      }}
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
              {/* 调节播放速度 */}
              <div className={style.speedBtn}>
                <div
                  className={speedBtnPicClass}
                  onClick={e => {
                    e.stopPropagation();
                    this.showSpeedBarTemporally();
                    this.setState({ isShowControlBar: false });
                    this.setState({ isShowPlayBtn: false });
                  }}
                />
              </div>
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
                    onClick={e => {
                      e.stopPropagation();
                      this.playOrPause();
                    }}
                  />
                </div>
              </React.Fragment>
            ) : (
                <React.Fragment>
                  <img className={style.pic} src={video.cover} alt={video.title} />
                  <div className={style.prePlay}>
                    <div
                      className={style.preview}
                      onClick={e => {
                        e.stopPropagation();
                        this.playOrPause();
                      }}
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
                  onClick={e => {
                    e.stopPropagation();
                    this.playOrPause();
                  }}
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