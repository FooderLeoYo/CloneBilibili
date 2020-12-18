import * as React from "react";
import * as Hls from "hls.js";

import Context from "../../context";
import { getBarrages } from "../../api/video";

import Barrage, { BarrageType } from "./child-components/Barrage";
import PlayerLoading from "./child-components/PlayerLoading"
import { formatDuration } from "../../customed-methods/string";
import storage from "../../customed-methods/storage";

import style from "./stylus/player.styl?css-modules";

interface PlayerProps {
  isLive: boolean; // 该视频是否是直播
  isStreaming?: boolean; // 主播是否正在直播
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
  isStreaming: boolean;
  isShowSpeedBar: boolean;
  isShowCenterSpeed: boolean;
  gestureType: number; // 手势类型：0：无手势；1：左右滑动；2：右边的上下滑动；3：左边的上下滑动
  isShowCenterVolume: boolean;
  isShowCenterBri: boolean;
  centerSpeed: number;
}

class Player extends React.PureComponent<PlayerProps, PlayerState> {
  /* 以下为初始化 */
  private playerRef: React.RefObject<HTMLDivElement>;
  private videoAreaWrapperRef: React.RefObject<HTMLDivElement>;
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
  private speedBtnRef: React.RefObject<HTMLDivElement>;
  private barrageBtnRef: React.RefObject<HTMLDivElement>;
  private fullscreenBtnRef: React.RefObject<HTMLDivElement>;
  private speedBarRef: React.RefObject<HTMLUListElement>;
  private curVolumeRef: React.RefObject<HTMLSpanElement>;
  private progressWrapperRef: React.RefObject<HTMLDivElement>;
  private curBrightnessRef: React.RefObject<HTMLDivElement>;
  private lastPosWrapperRef: React.RefObject<HTMLDivElement>;

  private lastPlayPos: number;
  private duration: number;
  private initBarrages: Array<any>; // 拿到数据时的初始格式，供slice后生成barrages
  private barrages: Array<any>; // 真正发送到播放器中的弹幕
  private ctrBarTimer: number; // 控制鼠标静止一段时间后隐藏控制条的定时器
  private easeTimer: number;
  private playBtnTimer: number;
  // private isIos: boolean;
  // private isAndroid: boolean;
  private isPC: boolean;
  private speedBtnSuffix: string;
  private progressWidth: number;
  private progressLeft: number;

  public static defaultProps = {
    isLive: false,
    isStreaming: false,
    liveTime: 0
  };

  constructor(props) {
    super(props);

    this.playerRef = React.createRef();
    this.videoAreaWrapperRef = React.createRef();
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
    this.speedBtnRef = React.createRef();
    this.barrageBtnRef = React.createRef();
    this.fullscreenBtnRef = React.createRef();
    this.speedBarRef = React.createRef();
    this.curVolumeRef = React.createRef();
    this.progressWrapperRef = React.createRef();
    this.curBrightnessRef = React.createRef();
    this.lastPosWrapperRef = React.createRef();

    // this.isIos = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 只写一个!会报错
    // this.isAndroid = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1;
    // this.isPC = !this.isIos && !this.isAndroid;
    // this.isPC = !(navigator.userAgent.match(/(iPhone|iPad|iPod|iOS|Android)/i) !== null);
    this.isPC = !(/(Safari|iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent));
    this.speedBtnSuffix = "1";
    this.duration = -1;
    this.lastPlayPos = -1;

    this.state = {
      paused: true,
      waiting: false,
      barrageSwitch: true,
      isFullscreen: false,
      finish: false,
      isShowCover: true,
      isShowControlBar: true,
      isShowPlayBtn: true,
      isStreaming: props.isStreaming,
      isShowSpeedBar: false,
      isShowCenterSpeed: false,
      gestureType: 0,
      isShowCenterVolume: false,
      isShowCenterBri: false,
      centerSpeed: 1
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

    if (this.props.isLive) {
      this.showControlsTemporally();
    }
    const setPlayState = () => {
      this.setState({
        isShowCover: false,
        paused: false,
        waiting: false
      });
    }

    // "play"是HTML DOM 事件onplay的事件类型，而不是一个自定义名称
    if (!this.props.isLive) {
      videoDOM.addEventListener("play", setPlayState);
    }
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
          isStreaming: false
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
              isStreaming: false
            });
          }
        }
      });
    }
  }

  private getLastPlayPos = () => {
    const targetHistory = storage.getPlayPositionHistory().
      find(v => v.aId === this.props.video.aId);

    if (targetHistory) { // 如果是不是第一次打开该视频，才执行相关操作
      this.lastPlayPos = targetHistory.position;
      setTimeout(() => {
        this.lastPosWrapperRef.current.classList.add(style.graduallyHide);
      }, 5000);
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
  private setActivedColor = dom => {
    dom.addEventListener("touchstart", () => {
      dom.style.color = "#de698c";
    })
    dom.addEventListener("touchend", () => {
      dom.style.color = "#ffffff";
    })
  }

  private setElesActivedColor = () => {
    this.setActivedColor(this.ctrPlayBtnRef.current);
    this.setActivedColor(this.barrageBtnRef.current);
    this.setActivedColor(this.fullscreenBtnRef.current);
    if (!this.props.isLive) {
      this.setActivedColor(this.speedBtnRef.current);
    }
  }

  private setGraduallyHide = (DOM, startTime) => {
    this.easeTimer = setTimeout(() => {
      DOM.classList.add(style.graduallyHide);
    }, startTime);
    setTimeout(() => {
      DOM.classList.remove(style.graduallyHide);
    }, startTime + 500);
  }

  private showControls = () => {
    clearTimeout(this.ctrBarTimer);
    clearTimeout(this.easeTimer);
    this.controlBarRef.current.classList.remove(style.graduallyHide);

    this.setState({ isShowControlBar: true });
  }

  private showControlsTemporally = () => {
    const controlBarDOM = this.controlBarRef.current;
    this.showControls();
    this.setGraduallyHide(controlBarDOM, 2000);
    this.ctrBarTimer = setTimeout(() => {
      this.setState({ isShowControlBar: false });
    }, 2500);
  }

  private setFingerListener = () => {
    // 用barrageContainerDOM而不是videoAreaDOM的原因，见player.styl中各DOM的层级关系
    const barrageContainerDOM = this.barrageContainerRef.current;
    const barrageWidth = barrageContainerDOM.getBoundingClientRect().width;
    const barrageHeight = barrageContainerDOM.getBoundingClientRect().height;
    const videoDOM = this.videoRef.current;
    let initVolume: number;
    let initTime: number;
    let timeAfterChange: number;
    let initProgress: number;
    let initBrightness: number = 1;
    let briAfterChange: number;
    let startPos = {
      x: 0,
      y: 0
    };

    if (!this.props.isLive) {
      barrageContainerDOM.addEventListener("touchstart", e => {
        // 设置触摸事件的初始值
        this.setState({ gestureType: 0 });
        startPos = {
          x: e.targetTouches[0].pageX,
          y: e.targetTouches[0].pageY
        };
        initVolume = videoDOM.volume;
        initTime = videoDOM.currentTime;
        initProgress = initTime / videoDOM.duration;
      });

      barrageContainerDOM.addEventListener("touchmove", e => {
        // 防止滑动拖动整个videoPage
        e.preventDefault();
        e.stopPropagation();

        const curPos = {
          x: e.targetTouches[0].pageX,
          y: e.targetTouches[0].pageY
        };
        const moveRatio = {
          x: (curPos.x - startPos.x) / barrageWidth,
          y: (curPos.y - startPos.y) / barrageHeight
        };

        // 判断this.state.gestureType === 1目的是：
        // 在本次touch中，如果手势之前已经处于“左右滑动”状态，则不会进入“上下滑动”
        if (this.state.gestureType === 1 || (this.state.gestureType === 0 &&
          Math.abs(moveRatio.x) > Math.abs(moveRatio.y))) { // 左右滑动
          const progressDOM = this.progressRef.current;
          const currentTimeDOM = this.currentTimeRef.current;
          const progressAfterChange = initProgress + moveRatio.x;

          if (this.state.gestureType !== 1) {
            this.setState({ gestureType: 1 });
          }
          videoDOM.removeEventListener("timeupdate", this.setTimeupdateListener);
          this.showControls();

          timeAfterChange = initTime + videoDOM.duration * moveRatio.x;
          if (timeAfterChange >= videoDOM.duration) {
            currentTimeDOM.innerHTML = formatDuration(videoDOM.duration, "0#:##");
            progressDOM.style.width = "100%";
          } else if (timeAfterChange <= 0) {
            currentTimeDOM.innerHTML = formatDuration(0, "0#:##");
            progressDOM.style.width = "0%";
          } else {
            currentTimeDOM.innerHTML = formatDuration(timeAfterChange, "0#:##");
            progressDOM.style.width = `${progressAfterChange * 100}%`;
          }
        } else if (this.state.gestureType === 2 || (this.state.gestureType === 0 &&
          curPos.x > barrageWidth / 2)) { // 右边的上下滑动
          const curVolumeDOM = this.curVolumeRef.current;
          if (this.state.gestureType !== 2) {
            this.setState({ gestureType: 2 });
          }
          this.setState({ isShowCenterVolume: true });

          let volumeAfterChange = initVolume - moveRatio.y; // y轴向下为正，因此取反
          if (volumeAfterChange <= 0) {
            curVolumeDOM.style.width = `0%`;
            volumeAfterChange = 0;
            return;
          } else if (volumeAfterChange >= 1) {
            curVolumeDOM.style.width = `100%`;
            volumeAfterChange = 1;
            return;
          } else {
            curVolumeDOM.style.width = `${volumeAfterChange * 100}%`;
            videoDOM.volume = volumeAfterChange;
          }
        } else { // 左边的上下滑动
          const curBrightnessDOM = this.curBrightnessRef.current;
          if (this.state.gestureType !== 3) {
            this.setState({ gestureType: 3 });
          }
          this.setState({ isShowCenterBri: true });

          briAfterChange = initBrightness - moveRatio.y;
          if (briAfterChange <= 0) {
            curBrightnessDOM.style.width = `0%`;
            briAfterChange = 0;
            return;
          } else if (briAfterChange >= 1) {
            curBrightnessDOM.style.width = `100%`;
            briAfterChange = 1;
            return;
          } else {
            curBrightnessDOM.style.width = `${briAfterChange * 100}%`;
            videoDOM.style.filter = `brightness(${briAfterChange})`;
          }
        }
      });
    }

    barrageContainerDOM.addEventListener("touchend", e => {
      e.stopPropagation();

      if (this.state.gestureType === 0) {
        if (!this.state.isShowControlBar) {
          this.showControlsTemporally();
        } else {
          this.setState({ isShowControlBar: false });
        }
      } else if (this.state.gestureType === 1) {
        videoDOM.currentTime = timeAfterChange;
        videoDOM.addEventListener("timeupdate", this.setTimeupdateListener);
        this.showControlsTemporally();
      } else if (this.state.gestureType === 2) {
        setTimeout(() => {
          this.setState({ isShowCenterVolume: false });
        }, 200);
      } else {
        initBrightness = briAfterChange;
        setTimeout(() => {
          this.setState({ isShowCenterBri: false });
        }, 200);
      }
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
    const videoDur = videoDOM.duration
    const barrageComponent = this.barrageRef.current;
    const currentTimeDOM = this.currentTimeRef.current;
    const progressDOM = this.progressRef.current;
    // 初始化时设置duration
    if (this.duration === 0) {
      this.duration = videoDur;
    }

    // 更新进度条
    currentTimeDOM.innerHTML = formatDuration(videoDOM.currentTime, "0#:##");
    const progress = videoDOM.currentTime / videoDur * 100;
    progressDOM.style.width = `${progress}%`;

    // 加载当前时点的弹幕
    if (this.state.barrageSwitch) {
      const barrages = this.findBarrages(videoDOM.currentTime);
      // 如果当前正在播放，则发送弹幕
      if (!this.state.paused) {
        barrages.forEach(barrage => {
          barrageComponent.send(barrage);
        });
      }
    }
  }

  private setProgressDOM = () => {
    const videoDOM = this.videoRef.current;
    const progressDOM = this.progressRef.current;
    const progressWrapperDOM = progressDOM.parentElement;
    const progressBtnDOM = this.progressBtnRef.current;
    const currentTimeDOM = this.currentTimeRef.current;

    let rate = -1; // 拖拽进度比例

    // 触碰进度条时，设置width和left
    progressBtnDOM.addEventListener("touchstart", e => {
      e.stopPropagation();
      if (this.ctrBarTimer !== 0) { clearTimeout(this.ctrBarTimer); }
      if (this.easeTimer !== 0) { clearTimeout(this.easeTimer); }
      videoDOM.removeEventListener("timeupdate", this.setTimeupdateListener);
    });

    progressBtnDOM.addEventListener("touchmove", e => {
      e.stopPropagation();
      e.preventDefault(); // 阻止屏幕被拖动

      // 计算拖拽进度比例
      const touch = e.touches[0];
      rate = (touch.pageX - this.progressLeft) / this.progressWidth;
      // 手指点在进度条以外
      if (rate > 1) { rate = 1; }
      else if (rate < 0) { rate = 0; }
      // 进度条以内
      else {
        const currentTime = videoDOM.duration * rate;
        progressDOM.style.width = `${rate * 100}%`;
        currentTimeDOM.innerHTML = formatDuration(currentTime, "0#:##");

        this.controlBarRef.current.classList.remove(style.graduallyHide);
      }
    });

    progressBtnDOM.addEventListener("touchend", e => {
      e.stopPropagation();
      videoDOM.currentTime = videoDOM.duration * rate;
      videoDOM.addEventListener("timeupdate", this.setTimeupdateListener);
      this.showControlsTemporally();
    });

    this.progressWidth = progressWrapperDOM.offsetWidth;
    this.progressLeft = progressWrapperDOM.getBoundingClientRect().left;
  }

  private changePlayPosition(e) {
    const progress = (e.clientX - this.progressLeft) / this.progressWidth;
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

    this.setState({ centerSpeed: speed });
    this.setState({ isShowCenterSpeed: true });
    if (this.state.paused) {
      this.showPlayBtn();
    }
    setTimeout(() => {
      this.setState({ isShowCenterSpeed: false });
    }, 1000);

    // btnPlaySpeed不能直接用speed，因为iconfont命名不允许有小数点
    switch (speed) {
      case 0.5:
        this.speedBtnSuffix = "0point5";
        break;
      case 0.75:
        this.speedBtnSuffix = "0point75";
        break;
      case 1:
        this.speedBtnSuffix = "1";
        break;
      case 1.5:
        this.speedBtnSuffix = "1point5";
        break;
      case 2:
        this.speedBtnSuffix = "2";
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

  private showPlayBtn = () => {
    if (this.playBtnTimer != 0) {
      clearTimeout(this.playBtnTimer);
    }

    if (!this.state.isShowPlayBtn) {
      this.setState({ isShowPlayBtn: true });
    }
  }

  private entryOrExitFullscreen() {
    const playerDOM: any = this.playerRef.current;
    // const videoDOM: any = this.videoRef.current;
    // const videoAreaWrapperDOM = this.videoAreaWrapperRef.current;

    if (this.state.isFullscreen) {
      const doc: any = document;

      this.setState({ isFullscreen: false });
      // videoAreaWrapperDOM.classList.remove(style.fullScreen);
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
      // videoAreaWrapperDOM.classList.add(style.fullScreen);
      if (playerDOM.requestFullscreen) {
        playerDOM.requestFullscreen();
      } else if (playerDOM.mozRequestFullScreen) {
        playerDOM.mozRequestFullScreen();
      } else if (playerDOM.webkitRequestFullScreen) {
        playerDOM.webkitRequestFullScreen();
      } else if (playerDOM.msRequestFullscreen) {
        playerDOM.msRequestFullscreen();
      }
    }
  }

  /* 以下为生命周期函数 */
  public componentDidMount() {
    const { isLive } = this.props;

    // 设置相关监听器
    this.setThumbnailListener();
    this.setElesActivedColor();
    if (this.isPC) {
      this.setMouseListener();
    } else {
      this.setFingerListener();
    }

    if (!isLive) { // 非直播时处理
      this.getLastPlayPos();
      this.setVideoDOMListener();
      this.setProgressDOM();
      this.getBarrages();
    } else { // 直播时处理
      if (this.props.liveTime) {
        this.setLiveDurationDOM();
      }
      this.setLiveVideoDOM();
    }
  }

  public componentWillUnmount() {
    if (!this.props.isLive) {
      storage.setPlayPositionHistory({
        aId: this.props.video.aId,
        position: this.videoRef.current.currentTime
      })
    }
  }

  /* 以下为渲染部分 */
  public render() {
    const { isLive, video } = this.props;
    const videoCoverStyle = { display: this.state.isShowCover ? "none" : "block" };
    const coverStyle = { display: this.state.isShowCover ? "block" : "none" };
    const controlBarStyle = { display: this.state.isShowControlBar ? "block" : "none" };
    const playBtnStyle = { display: this.state.isShowPlayBtn ? "block" : "none" };
    // 注意这里设置显示不能是block，因为会覆盖掉css中的grid
    // 所以直接设成grid，css还可以省去display: grid
    const speedBarStyle = { display: this.state.isShowSpeedBar ? "grid" : "none" };
    const centerSpeedStyle = { display: this.state.isShowCenterSpeed ? "block" : "none" };/*  */
    const centerVolumeStyle = { display: this.state.isShowCenterVolume ? "block" : "none" };/*  */
    const centerBriStyle = { display: this.state.isShowCenterBri ? "block" : "none" };/*  */
    const playBtnIconName = this.state.paused ? "play" : "pause";
    const ctrPlayBtnIconName = this.state.paused ? "Play" : "Pause";
    const barrageBtnIconName = this.state.barrageSwitch ? "On" : "Off";
    const videoDOM = this.videoRef.current;

    return (
      <div className={style.videoPlayer} ref={this.playerRef}>
        {/* 视频区域 */}
        <div className={style.videoAreaWrapper} ref={this.videoAreaWrapperRef}>
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
              src={isLive ? "" : this.getVideoUrl(video.url)}
              style={videoCoverStyle}
              ref={this.videoRef}
            />
          </div>
          {/* 弹幕 */}
          {/* 不把Barrage放进videoArea中是因为： */}
          {/*   如果Barrage成为videoArea的子元素，那么Barrage的事件会冒泡到videoArea */}
          {/*   这样就还要阻止Barrage的事件冒泡，所以不如将其放在外面 */}
          <div className={style.barrage} ref={this.barrageContainerRef}>
            <Barrage opacity={isLive ? 1 : 0.75} ref={this.barrageRef} />
          </div>
          <div className={style.controlContainer}>
            {/* 是否跳转到上次播放位置 */}
            {
              this.lastPlayPos !== -1 ? <div
                className={style.lastPosWrapper}
                ref={this.lastPosWrapperRef}
              >
                <span className={style.lastPos}>
                  {`记忆您上次看到${formatDuration(this.lastPlayPos, "0#:##")}`}
                </span>
                <span
                  className={style.jumpToPos}
                  onClick={() => videoDOM.currentTime = this.lastPlayPos}
                >
                  {`跳转播放`}
                </span>
              </div> : null
            }
            {/* 调节音量后显示当前音量 */}
            <div className={style.curVolumeContainer} style={centerVolumeStyle}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-volume"></use>
              </svg>
              <div className={style.volumeBarContainer}>
                <span className={style.curVolume} ref={this.curVolumeRef} />
              </div>
            </div>
            {/* 调节亮度后显示当前亮度 */}
            <div className={style.curBrightnessContainer} style={centerBriStyle}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-brightness"></use>
              </svg>
              <div className={style.britnessBarContainer}>
                <span className={style.curBrightness} ref={this.curBrightnessRef} />
              </div>
            </div>
            {/* 速度调节及显示 */}
            <div className={style.speedContainer}>
              <span
                className={style.centerSpeed}
                style={centerSpeedStyle}
              >{`${this.state.centerSpeed}x`}
              </span>
              <div className={style.speedBarWrapper}>
                <ul
                  className={style.speedBar} style={speedBarStyle} ref={this.speedBarRef}
                >
                  <li
                    style={{ color: this.state.centerSpeed === 0.5 ? "#de698c" : "#ffffff" }}
                    onClick={e => {
                      e.stopPropagation();
                      this.setPlaySpeed(0.5);
                      this.setState({ isShowSpeedBar: false });
                    }}
                    key={0.5}
                  >{0.5}</li>
                  <li
                    style={{ color: this.state.centerSpeed === 0.75 ? "#de698c" : "#ffffff" }}
                    onClick={e => {
                      e.stopPropagation();
                      this.setPlaySpeed(0.75);
                      this.setState({ isShowSpeedBar: false });
                    }}
                    key={0.75}
                  >{0.75}</li>
                  <li
                    style={{ color: this.state.centerSpeed === 1 ? "#de698c" : "#ffffff" }}
                    onClick={e => {
                      e.stopPropagation();
                      this.setPlaySpeed(1);
                      this.setState({ isShowSpeedBar: false });
                    }}
                    key={1}
                  >{1}</li>
                  <li
                    style={{ color: this.state.centerSpeed === 1.5 ? "#de698c" : "#ffffff" }}
                    onClick={e => {
                      e.stopPropagation();
                      this.setPlaySpeed(1.5);
                      this.setState({ isShowSpeedBar: false });
                    }}
                    key={1.5}
                  >{1.5}</li>
                  <li
                    style={{ color: this.state.centerSpeed === 2 ? "#de698c" : "#ffffff" }}
                    onClick={e => {
                      e.stopPropagation();
                      this.setPlaySpeed(2);
                      this.setState({ isShowSpeedBar: false });
                    }}
                    key={2}
                  >{2}</li>
                </ul>
              </div>
            </div>
            {/* 右边的白色播放暂停按钮 */}
            {
              !isLive ?
                <div
                  className={style.playButton}
                  style={playBtnStyle}
                  onClick={e => {
                    e.stopPropagation(); // 阻止点击冒泡到controls
                    this.playOrPause();
                  }}
                >
                  <svg className="icon" aria-hidden="true">
                    <use href={`#icon-${playBtnIconName}`}></use>
                  </svg>
                </div> : null
            }
            {/* 控制栏 */}
            <div
              className={style.controlBar + (isLive ? " " + style.liveControl : "")}
              style={controlBarStyle}
              ref={this.controlBarRef}
            >
              {/* 控制栏播放按钮 */}
              <div
                className={style.controlBarPlayBtn}
                ref={this.ctrPlayBtnRef}
                onClick={e => {
                  e.stopPropagation();
                  this.playOrPause();
                }}
              >
                <svg className="icon" aria-hidden="true">
                  <use href={`#icon-ctr${ctrPlayBtnIconName}`}></use>
                </svg>
              </div>
              {
                !isLive ? (
                  // React.Fragment和空的div类似，都是在最外层起到包裹的作用
                  // 区别是React.Fragment不会真实的html元素，这样就减轻了浏览器渲染压力
                  <React.Fragment>
                    {/* 当前时间、视频总时长 */}
                    <div className={style.left}>
                      <span className={style.time} ref={this.currentTimeRef}>00:00</span>
                      <span className={style.split}>/</span>
                      <span className={style.totalDuration}>
                        {formatDuration(video.duration, "0#:##")}
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
                        ref={this.progressWrapperRef}
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
                {
                  !this.props.isLive ?
                    <div
                      className={style.speedBtn}
                      ref={this.speedBtnRef}
                      onClick={e => {
                        e.stopPropagation();
                        this.showSpeedBarTemporally();
                        this.setState({ isShowControlBar: false });
                        this.setState({ isShowPlayBtn: false });
                      }}
                    >
                      <svg className="icon" aria-hidden="true">
                        <use href={`#icon-speed${this.speedBtnSuffix}`}></use>
                      </svg>
                    </div> : null
                }
                {/* 弹幕开关 */}
                <div
                  className={style.barrageBtn}
                  ref={this.barrageBtnRef}
                  onClick={e => {
                    e.stopPropagation();
                    this.onOrOff();
                  }}
                >
                  <svg className="icon" aria-hidden="true">
                    <use href={`#icon-barrage${barrageBtnIconName}`}></use>
                  </svg>
                </div>
                {/* 全屏开关 */}
                <div
                  className={style.fullscreenBtn}
                  ref={this.fullscreenBtnRef}
                  onClick={e => {
                    e.stopPropagation();
                    this.entryOrExitFullscreen();
                  }}
                >
                  <svg className="icon" aria-hidden="true">
                    <use href="#icon-fullscreenBtn"></use>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {/* 封面 */}
          <div className={style.cover} style={coverStyle}>
            {
              !isLive ? (
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
                    >
                      <svg className="icon" aria-hidden="true">
                        <use href="#icon-play"></use>
                      </svg>
                    </div>
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
                  <span className={style.animation}>
                    {/* <svg className="icon" aria-hidden="true">
                      <use href="#icon-loading"></use>
                    </svg> */}
                    <PlayerLoading />
                  </span>
                  <span className={style.text}>
                    {!isLive ? "正在缓冲" : ""}
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
                    <span className={style.replayIcon}>
                      <svg className="icon" aria-hidden="true">
                        <use href="#icon-replay"></use>
                      </svg>
                    </span>
                    <span className={style.replayWords}>重新播放</span>
                  </div>
                </div>
              </div>
            ) : null
          }
          { // 直播时，主播不在
            isLive && !this.state.isStreaming ? (
              <div className={style.noticeCover}>
                <div className={style.noticeWrapper}>
                  <i />
                  <span>闲置中...</span>
                </div>
              </div>
            ) : null
          }
        </div>
      </div>
    );
  }
}

Player.contextType = Context;

export default Player;