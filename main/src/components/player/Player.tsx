import * as React from "react";
import * as Hls from "hls.js";

import myContext from "../../context";
import { getBarrages } from "../../api/video";

import Speed from "./child-components/speed/Speed"
import LastPosition from "./child-components/last-position/LastPosition"
import Barrage, { BarrageType } from "./child-components/barrage/Barrage";
import PlayerLoading from "./child-components/player-loading/PlayerLoading"
import { formatDuration } from "../../customed-methods/string";

import style from "./stylus/player.styl?css-modules";

interface PlayerProps {
  isLive: boolean, // 该视频是否是直播
  video: {
    aId: number,
    cId: number,
    title: string,
    cover: string,
    duration: number,
    url: string
  },
  isStreaming?: boolean, // 主播是否正在直播
  liveTime?: number
}

const { useState, useEffect, useRef, useContext } = React;
let sendBarrage: Function;

function Player(props: PlayerProps) {
  /* 以下为初始化 */
  const [waiting, setWaiting] = useState(false);
  const [barrageSwitch, setBarrageSwitch] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [finish, setFinish] = useState(false);
  const [isShowCover, setIsShowCover] = useState(true);
  const [isShowPlayBtn, setIsShowPlayBtn] = useState(true);
  const [isStreaming, setIsStreaming] = useState(props.isStreaming);
  const [isShowCenterVolume, setIsShowCenterVolume] = useState(false);
  const [isShowCenterBri, setIsShowCenterBri] = useState(false);
  const [speedBtnSuffix, setSpeedBtnSuffix] = useState("1");

  const playerRef: React.RefObject<HTMLDivElement> = useRef(null);
  const playerWrapperRef: React.RefObject<HTMLDivElement> = useRef(null);
  const videoRef: React.RefObject<HTMLVideoElement> = useRef(null);
  const videoAreaRef: React.RefObject<HTMLDivElement> = useRef(null);
  const barrageContainerRef: React.RefObject<HTMLDivElement> = useRef(null);
  const barrageRef: React.RefObject<Barrage> = useRef(null);
  const controlBarRef: React.RefObject<HTMLDivElement> = useRef(null);
  const currentTimeRef: React.RefObject<HTMLSpanElement> = useRef(null);
  const progressRef: React.RefObject<HTMLDivElement> = useRef(null);
  const liveDurationRef: React.RefObject<HTMLDivElement> = useRef(null);
  const progressBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const ctrPlayBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const speedBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const barrageBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const fullscreenBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const curVolumeRef: React.RefObject<HTMLSpanElement> = useRef(null);
  const progressWrapperRef: React.RefObject<HTMLDivElement> = useRef(null);
  const curBrightnessRef: React.RefObject<HTMLDivElement> = useRef(null);

  const [isShowControlBar, setIsShowControlBar] = useState(true);
  const showCtrBarRef = useRef(isShowControlBar);
  if (showCtrBarRef.current !== isShowControlBar) {
    showCtrBarRef.current = isShowControlBar;
  }

  const [paused, setPaused] = useState(true);
  const pausedRef = useRef(paused);
  if (pausedRef.current !== paused) { pausedRef.current = paused; }

  const [gestureType, setGestureType] = useState(0); // 手势类型：0：无手势；1：左右滑动；2：右边的上下滑动；3：左边的上下滑动
  const gestureTypeRef = useRef(gestureType);
  if (gestureTypeRef.current !== gestureType) { gestureTypeRef.current = gestureType; }

  const speedRef = useRef(null);

  const { isLive, video } = props;
  const context = useContext(myContext);

  const videoCoverStyle = { display: isShowCover ? "none" : "block" };
  const coverStyle = { display: isShowCover ? "block" : "none" };
  const controlBarStyle = { display: isShowControlBar ? "block" : "none" };
  const playBtnStyle = { display: isShowPlayBtn ? "block" : "none" };
  const centerVolumeStyle = { display: isShowCenterVolume ? "block" : "none" };
  const centerBriStyle = { display: isShowCenterBri ? "block" : "none" };
  const playBtnIconName = paused ? "play" : "pause";
  const ctrPlayBtnIconName = paused ? "Play" : "Pause";
  const barrageBtnIconName = barrageSwitch ? "On" : "Off";

  let initBarrages: Array<any>; // 拿到数据时的初始格式，供slice后生成barrages
  let barrages: Array<any>; // 真正发送到播放器中的弹幕
  let ctrBarTimer: number; // 控制鼠标静止一段时间后隐藏控制条的定时器
  let easeTimer: number;
  let isPC: boolean = !(/(Safari|iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent));
  let duration: number = -1;
  const playBtnTimerRef = useRef(0);
  // const isIos: boolean;
  // const isAndroid: boolean;
  // isIos = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 只写一个!会报错
  // isAndroid = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1;
  // isPC = !isIos && !isAndroid;
  // isPC = !(navigator.userAgent.match(/(iPhone|iPad|iPod|iOS|Android)/i) !== null);
  // public static defaultProps = {
  //   isLive: false,
  //   isStreaming: false,
  //   liveTime: 0
  // };


  /* 以下为自定义方法 */

  /* videoDOM相关 */
  function getVideoUrl(url) {
    const { videoURL } = context;
    // 对url统一编码为utf-8的格式到后台
    // 不加encodeURI的话，默认浏览器编码格式提交；浏览器不同时，传到后台的值也就不同了
    url = encodeURIComponent(url);
    // 拼接播放源地址
    return `${videoURL}?video=${url}`;
  }

  function playOrPause() {
    const videoDOM = videoRef.current;
    if (paused) {
      videoDOM.play();
      showControlsTemporally();
      playBtnTimerRef.current = setTimeout(() => { setIsShowPlayBtn(false); }, 800);
      setPaused(false);
      setFinish(false);
    } else {
      videoDOM.pause();
      showControlsTemporally();
      clearTimeout(playBtnTimerRef.current);
      setPaused(true);
      setIsShowPlayBtn(true);
    }
  }

  function setThumbnailListener() {
    const videoDOM = videoRef.current;

    if (props.isLive) { showControlsTemporally(); }
    function setPlayState() {
      setIsShowCover(false);
      setPaused(false);
      setWaiting(false);
    }

    // "play"是HTML DOM 事件onplay的事件类型，而不是一个自定义名称
    if (!props.isLive) { videoDOM.addEventListener("play", setPlayState); }
    videoDOM.addEventListener("playing", setPlayState);
    videoDOM.addEventListener("waiting", () => { setWaiting(true); });
  }

  function setVideoDOMListener() {
    const videoDOM = videoRef.current;

    // 当播放时间发生变动时，更新进度条并加载当前时点的弹幕
    videoDOM.addEventListener("timeupdate", setTimeupdateListener);

    // 视频结束时重置进度条和state
    videoDOM.addEventListener("ended", () => {
      currentTimeRef.current.innerHTML = "00:00";
      progressRef.current.style.width = "0";
      setPaused(true);
      setFinish(true);
      // 重新赋值弹幕列表
      barrages = initBarrages.slice();
      // 清除弹幕
      barrageRef.current.clear();
    });
  }

  function setLiveVideoDOM() {
    const videoDOM = videoRef.current;
    const { video } = props;

    // 支持m3u8，直接使用video播放
    if (videoDOM.canPlayType("application/vnd.apple.mpegurl")) {
      videoDOM.src = video.url;
      videoDOM.addEventListener("canplay", () => { videoDOM.play(); });
      videoDOM.addEventListener("error", () => { setIsStreaming(false); });
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
            data.response.code === 404) { setIsStreaming(false); }
        }
      });
    }
  }

  /* 弹幕相关 */
  function setBarrages() {
    getBarrages(props.video.cId).then(result => {
      let temp = [];
      if (result.code === "1") {
        result.data.forEach(data => {
          temp.push({
            type: data.type === "1" ? BarrageType.RANDOM : BarrageType.FIXED,
            color: "#" + Number(data.decimalColor).toString(16),
            content: data.content,
            time: Number(data.time)
          });
        });
      }

      // 初始化弹幕列表
      initBarrages = temp;
      barrages = initBarrages.slice();
    });
  }

  sendBarrage = (data: { color: string, content: string }) => {
    if (barrageSwitch) {
      barrageRef.current.send({
        type: BarrageType.RANDOM,
        color: data.color,
        content: data.content
      });
    }
  }


  //  根据时间查找弹幕
  function findBarrages(time) {
    // 查找到的弹幕
    const temp = [];
    // 查找到的弹幕索引
    const indexs = [];
    barrages.forEach((barrage, index) => {
      // 换成整数秒
      if (parseInt(barrage.time, 10) === parseInt(time, 10)) {
        temp.push(barrage);
        indexs.push(index);
      }
    });
    // 从barrages中删掉已经查找到的time时点的弹幕
    // 这样视频继续播放或移动播放位置触发findBarrages时，barrages.forEach的范围
    // 会缩小，搜索速度会加快
    // 从前往后删除，删掉前面的以后，后面的索引就变小了，因此要index - i
    indexs.forEach((index, i) => { barrages.splice(index - i, 1); });
    return temp;
  }


  /* 控制栏相关 */

  /* 控制栏整体相关 */
  function setActivedColor(dom) {
    dom.addEventListener("touchstart", () => { dom.style.color = "#de698c"; })
    dom.addEventListener("touchend", () => { dom.style.color = "#ffffff"; })
  }

  function setElesActivedColor() {
    setActivedColor(ctrPlayBtnRef.current);
    setActivedColor(barrageBtnRef.current);
    setActivedColor(fullscreenBtnRef.current);
    if (!props.isLive) { setActivedColor(speedBtnRef.current); }
  }

  function setGraduallyHide(DOM, startTime) {
    easeTimer = setTimeout(() => {
      DOM.classList.add(style.graduallyHide);
    }, startTime);
    setTimeout(() => {
      DOM.classList.remove(style.graduallyHide);
    }, startTime + 500);
  }

  function showControls() {
    clearTimeout(ctrBarTimer);
    clearTimeout(easeTimer);
    controlBarRef.current.classList.remove(style.graduallyHide);

    setIsShowControlBar(true);
  }

  function showControlsTemporally() {
    const controlBarDOM = controlBarRef.current;
    showControls();
    setGraduallyHide(controlBarDOM, 2000);
    ctrBarTimer = setTimeout(() => { setIsShowControlBar(false); }, 2500);
  }

  function setFingerListener() {
    // 用barrageContainerDOM而不是videoAreaDOM的原因，见player.styl中各DOM的层级关系
    const barrageContainerDOM = barrageContainerRef.current;
    const videoDOM = videoRef.current;
    const curBrightnessDOM = curBrightnessRef.current;
    const curVolumeDOM = curVolumeRef.current;
    const gesRef = gestureTypeRef.current;

    let barrageWidth = 0;
    let barrageHeight = 0;
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

    curBrightnessDOM.style.width = `100%`;
    curVolumeDOM.style.width = `100%`;

    if (!props.isLive) {
      barrageContainerDOM.addEventListener("touchstart", e => {
        // 设置触摸事件的初始值
        setGestureType(0);
        startPos = {
          x: e.targetTouches[0].pageX,
          y: e.targetTouches[0].pageY
        };
        initVolume = videoDOM.volume;
        initTime = videoDOM.currentTime;
        initProgress = initTime / videoDOM.duration;
        // 这两个求长度不能提到外面，因为横屏、全屏后会变
        barrageWidth = barrageContainerDOM.getBoundingClientRect().width;
        barrageHeight = barrageContainerDOM.getBoundingClientRect().height;
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

        // 判断gestureType === 1目的是：
        // 在本次touch中，如果手势之前已经处于“左右滑动”状态，则不会进入“上下滑动”
        if (gesRef === 1 || (gesRef === 0 &&
          Math.abs(moveRatio.x) > Math.abs(moveRatio.y))) { // 左右滑动
          const progressDOM = progressRef.current;
          const currentTimeDOM = currentTimeRef.current;
          let progressAfterChange = initProgress + moveRatio.x;

          if (gesRef !== 1) { setGestureType(1); }
          videoDOM.removeEventListener("timeupdate", setTimeupdateListener);
          showControls();

          if (progressAfterChange > 1 || progressAfterChange < 0) { return; }
          else {
            timeAfterChange = initTime + videoDOM.duration * moveRatio.x;
            currentTimeDOM.innerHTML = formatDuration(timeAfterChange, "0#:##");
            progressDOM.style.width = `${progressAfterChange * 100}%`;
          }
        } else if (gesRef === 2 || (gesRef === 0 &&
          curPos.x > barrageWidth / 2)) { // 右边的上下滑动
          if (gesRef !== 2) { setGestureType(2); }
          setIsShowCenterVolume(true);

          let volumeAfterChange = initVolume - moveRatio.y; // y轴向下为正，因此取反
          if (volumeAfterChange < 0 || volumeAfterChange > 1) { return; }
          else {
            curVolumeDOM.style.width = `${volumeAfterChange * 100}%`;
            videoDOM.volume = volumeAfterChange;
          }
        } else { // 左边的上下滑动
          if (gesRef !== 3) { setGestureType(3); }
          setIsShowCenterBri(true);

          briAfterChange = initBrightness - moveRatio.y;
          // 这个重置必须有，否则下次滑动时，briAfterChange将是负数
          // 而进度和音量不用重置，是因为它们本来就被限定在0~1之间，而亮度则可以大于1和取负数
          if (briAfterChange < 0) { briAfterChange = 0; }
          else if (briAfterChange > 1) { briAfterChange = 1; }
          else {
            curBrightnessDOM.style.width = `${briAfterChange * 100}%`;
            videoDOM.style.filter = `brightness(${briAfterChange})`;
          }
        }
      });
    }

    barrageContainerDOM.addEventListener("touchend", e => {
      const gesRef = gestureTypeRef.current;
      e.stopPropagation();

      if (gesRef === 0) {
        if (!showCtrBarRef.current) { showControlsTemporally(); }
        else { setIsShowControlBar(false); }
      } else if (gesRef === 1) {
        videoDOM.currentTime = timeAfterChange;
        videoDOM.addEventListener("timeupdate", setTimeupdateListener);
        showControlsTemporally();
      } else if (gesRef === 2) {
        setTimeout(() => { setIsShowCenterVolume(false); }, 200);
      } else {
        initBrightness = briAfterChange;
        setTimeout(() => { setIsShowCenterBri(false); }, 200);
      }
    });
  }

  function setMouseListener() {
    const videoAreaDOM = videoAreaRef.current;
    const controlBarDOM = controlBarRef.current;
    // click事件不能正常显示/隐藏控制器，且会影响其他控制器子组件的点击
    // videoAreaDOM.addEventListener("click", (e) => {
    //   e.stopPropagation();
    //   e.preventDefault();
    //   clearTimeout(timer);
    //   if (!isShowControlBar) {
    //     showControlsTemporally();
    //   } else {
    //     hideControls();
    //   }
    // });

    // 鼠标移入视频区则显示控制器，2秒后隐藏
    videoAreaDOM.addEventListener("mouseover", e => {
      e.stopPropagation();
      showControlsTemporally();
    });
    // 鼠标移动过程中一直显示控制器
    videoAreaDOM.addEventListener("mousemove", e => {
      e.stopPropagation();
      clearTimeout(ctrBarTimer);
      showControlsTemporally();
    });
    // 鼠标移出视频区立即隐藏控制器
    videoAreaDOM.addEventListener("mouseout", e => {
      e.stopPropagation();
      clearTimeout(ctrBarTimer);
      setIsShowControlBar(false);
    });
    // 鼠标停留在控制器上时，一直显示控制器
    // 这里不绑定mouseover事件，是因为：
    //   触发mouseover后马上又触发videoAreaDOM的mousemove，进而调用showControlsTemporally
    //   这样控制器就会2秒后隐藏，而不是一直显示
    controlBarDOM.addEventListener("mousemove", e => {
      e.stopPropagation();
      clearTimeout(ctrBarTimer);
      showControlsTemporally();
    });
  }

  /* 进度条相关 */
  function setTimeupdateListener() {
    const videoDOM = videoRef.current;
    const videoDur = videoDOM.duration
    const barrageComponent = barrageRef.current;
    const currentTimeDOM = currentTimeRef.current;
    const progressDOM = progressRef.current;
    const curTime = videoDOM.currentTime;
    // 初始化时设置duration
    if (duration === 0) { duration = videoDur; }

    // 更新进度条
    currentTimeDOM.innerHTML = formatDuration(curTime, "0#:##");
    const progress = curTime / videoDur * 100;
    progressDOM.style.width = `${progress}%`;

    // 加载当前时点的弹幕
    if (barrageSwitch) {
      const barrages = findBarrages(curTime);
      // 如果当前正在播放，则发送弹幕
      if (!pausedRef.current) {
        barrages.forEach(barrage => {
          barrageComponent.send(barrage);
        });
      }
    }
  }

  function changePlayPosition(e) {
    const progressWrapperDOM = progressRef.current.parentElement;
    const videoDOM = videoRef.current;
    const progress = (e.clientX - progressWrapperDOM.getBoundingClientRect().left) / progressWrapperDOM.offsetWidth;

    videoDOM.currentTime = videoDOM.duration * progress;
    // 重新赋值弹幕列表
    barrages = initBarrages.slice();
    // 清除跳转前的弹幕
    barrageRef.current.clear();

    if (ctrBarTimer !== 0) { clearTimeout(ctrBarTimer); }
    if (easeTimer !== 0) { clearTimeout(easeTimer); }
    showControlsTemporally();
  }

  function setProgressDOM() {
    const videoDOM = videoRef.current;
    const progressDOM = progressRef.current;
    const progressWrapperDOM = progressWrapperRef.current;
    const progressBtnDOM = progressBtnRef.current;
    const currentTimeDOM = currentTimeRef.current;

    let progressWidth = 0;
    let progressLeft = 0;
    let rate = -1; // 拖拽进度比例

    progressWrapperDOM.addEventListener("click", e => {
      e.stopPropagation();
      changePlayPosition(e);
    })

    progressBtnDOM.addEventListener("touchstart", e => {
      e.stopPropagation();
      progressWidth = progressWrapperDOM.offsetWidth;
      progressLeft = progressWrapperDOM.getBoundingClientRect().left;
      if (ctrBarTimer !== 0) { clearTimeout(ctrBarTimer); }
      if (easeTimer !== 0) { clearTimeout(easeTimer); }
      videoDOM.removeEventListener("timeupdate", setTimeupdateListener);
    });

    progressBtnDOM.addEventListener("touchmove", e => {
      e.stopPropagation();
      e.preventDefault(); // 阻止屏幕被拖动

      // 计算拖拽进度比例
      rate = (e.touches[0].pageX - progressLeft) / progressWidth;
      if (rate > 1 || rate < 0) { return; } // 滑动到了进度条以外
      else { // 进度条以内
        controlBarRef.current.classList.remove(style.graduallyHide);

        progressDOM.style.width = `${rate * 100}%`;
        currentTimeDOM.innerHTML = formatDuration(videoDOM.duration * rate, "0#:##");
      }
    });

    progressBtnDOM.addEventListener("touchend", e => {
      e.stopPropagation();
      videoDOM.currentTime = videoDOM.duration * rate;
      videoDOM.addEventListener("timeupdate", setTimeupdateListener);
      showControlsTemporally();
    });
  }

  function setLiveDurationDOM() {
    const liveDurationDOM = liveDurationRef.current;
    let liveDuration = (new Date().getTime() - props.liveTime) / 1000;
    liveDurationDOM.innerHTML = formatDuration(liveDuration, "0#:##:##");
    setInterval(() => {
      liveDuration += 1;
      liveDurationDOM.innerHTML = formatDuration(liveDuration, "0#:##:##");
    }, 1000);
  }

  /* 控制栏其他按钮相关 */
  // 开启或关闭弹幕
  function onOrOff() {
    if (barrageSwitch) {
      barrageRef.current.clear();
      setBarrageSwitch(false);
    } else { setBarrageSwitch(true); }
  }

  function entryOrExitFullscreen() {
    const playerDOM: any = playerRef.current;
    // const videoDOM: any = videoRef.current;
    // const videoAreaWrapperDOM = videoAreaWrapperRef.current;

    if (isFullscreen) {
      const doc: any = document;

      setIsFullscreen(false);
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
      setIsFullscreen(true);
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

  function setSpeedListener() {
    speedBtnRef.current.addEventListener("click", e => {
      e.stopPropagation();
      speedRef.current.showSpeedBarTemporally();
      setIsShowControlBar(false);
      setIsShowPlayBtn(false);
    })
  }

  /* 以下为生命周期函数 */
  useEffect(() => {
    // 设置相关监听器
    setThumbnailListener();
    setElesActivedColor();
    if (isPC) { setMouseListener(); }
    else { setFingerListener(); }

    if (!isLive) { // 非直播时处理
      setSpeedListener();
      setVideoDOMListener();
      setProgressDOM();
      setBarrages();
    } else { setLiveVideoDOM(); } // 直播时处理
  }, []);

  /* 以下为渲染部分 */
  return (
    <div className={style.videoPlayer} ref={playerRef}>
      {/* 视频区域 */}
      <div className={style.playerWrapper} ref={playerWrapperRef}>
        <div className={style.videoArea} ref={videoAreaRef}>
          {/* 播放速度选择及当前所选速度 */}
          <video
            height="100%"
            width="100%"
            preload="auto"
            // playsinline是解决ios默认打开网页的时候，会自动全屏播放
            x5-playsinline="true"
            webkit-playsinline="true"
            playsInline={true}
            src={!isLive && getVideoUrl(video.url)}
            style={videoCoverStyle}
            ref={videoRef}
          />
        </div>
        {/* 弹幕 */}
        {/* 不把Barrage放进videoArea中是因为： */}
        {/*   如果Barrage成为videoArea的子元素，那么Barrage的事件会冒泡到videoArea */}
        {/*   这样就还要阻止Barrage的事件冒泡，所以不如将其放在外面 */}
        <div className={style.barrage} ref={barrageContainerRef}>
          <Barrage opacity={isLive ? 1 : 0.75} ref={barrageRef} />
        </div>
        <div className={style.controlContainer}>
          {/* 是否跳转到上次播放位置 */}
          {
            !isLive && <LastPosition
              video={video}
              videoRef={videoRef}
            />
          }
          {/* 调节音量后显示当前音量 */}
          <div className={style.curVolumeContainer} style={centerVolumeStyle}>
            <svg className="icon" aria-hidden="true">
              <use href="#icon-volume"></use>
            </svg>
            <div className={style.volumeBarContainer}>
              <span className={style.curVolume} ref={curVolumeRef} />
            </div>
          </div>
          {/* 调节亮度后显示当前亮度 */}
          <div className={style.curBrightnessContainer} style={centerBriStyle}>
            <svg className="icon" aria-hidden="true">
              <use href="#icon-brightness"></use>
            </svg>
            <div className={style.britnessBarContainer}>
              <span className={style.curBrightness} ref={curBrightnessRef} />
            </div>
          </div>
          {/* 速度调节及显示 */}
          <div className={style.speedContainer}>
            <Speed
              videoDOM={videoRef.current}
              paused={paused}
              playBtnTimer={playBtnTimerRef.current}
              isShowPlayBtn={isShowPlayBtn}
              setIsShowPlayBtn={setIsShowPlayBtn}
              setSpeedBtnSuffix={setSpeedBtnSuffix}
              easeTimer={easeTimer}
              setGraduallyHide={setGraduallyHide}
              ref={speedRef}
            />
          </div>
          {/* 右边的白色播放暂停按钮 */}
          {
            !isLive && <div
              className={style.playButton}
              style={playBtnStyle}
              onClick={e => {
                e.stopPropagation();
                playOrPause();
              }}
            >
              <svg className="icon" aria-hidden="true">
                <use href={`#icon-${playBtnIconName}`}></use>
              </svg>
            </div>
          }
          {/* 控制栏 */}
          <div
            className={style.controlBar + (isLive ? " " + style.liveControl : "")}
            style={controlBarStyle}
            ref={controlBarRef}
          >
            {/* 控制栏播放按钮 */}
            <div
              className={style.controlBarPlayBtn}
              ref={ctrPlayBtnRef}
              onClick={e => {
                e.stopPropagation();
                playOrPause();
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
                    <span className={style.time} ref={currentTimeRef}>00:00</span>
                    <span className={style.split}>/</span>
                    <span className={style.totalDuration}>
                      {formatDuration(video.duration, "0#:##")}
                    </span>
                  </div>
                  {/* 进度条 */}
                  <div className={style.center}>
                    <div
                      className={style.progressWrapper}
                      ref={progressWrapperRef}
                    >
                      <div className={style.progress} ref={progressRef} >
                        <span className={style.progressBtn} ref={progressBtnRef} />
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ) : ( // 直播时为直播时长
                  <div className={style.left} ref={liveDurationRef}></div>
                )
            }
            <div className={style.right}>
              {/* 调节播放速度 */}
              {
                !props.isLive &&
                <div className={style.speedBtn} ref={speedBtnRef} >
                  <svg className="icon" aria-hidden="true">
                    <use href={`#icon-speed${speedBtnSuffix}`}></use>
                  </svg>
                </div>
              }
              {/* 弹幕开关 */}
              <div
                className={style.barrageBtn}
                ref={barrageBtnRef}
                onClick={e => {
                  e.stopPropagation();
                  onOrOff();
                }}
              >
                <svg className="icon" aria-hidden="true">
                  <use href={`#icon-barrage${barrageBtnIconName}`}></use>
                </svg>
              </div>
              {/* 全屏开关 */}
              <div
                className={style.fullscreenBtn}
                ref={fullscreenBtnRef}
                onClick={e => {
                  e.stopPropagation();
                  entryOrExitFullscreen();
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
              <>
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
                      playOrPause();
                    }}
                  >
                    <svg className="icon" aria-hidden="true">
                      <use href="#icon-play"></use>
                    </svg>
                  </div>
                </div>
              </>
            ) : (
                <>
                  <img className={style.pic} src={video.cover} alt={video.title} />
                  <div className={style.prePlay}>
                    <div
                      className={style.preview}
                      onClick={e => {
                        e.stopPropagation();
                        playOrPause();
                      }}
                    />
                  </div>
                </>
              )
          }
        </div>
        {  // 正在缓冲
          waiting &&
          <div className={style.loading}>
            <div className={style.wrapper}>
              <span className={style.animation}>
                {/* <svg className="icon" aria-hidden="true">
                      <use href="#icon-loading"></use>
                    </svg> */}
                <PlayerLoading />
              </span>
              <span className={style.text}>
                {!isLive && "正在缓冲"}
              </span>
            </div>
          </div>
        }
        { // 重新播放
          finish &&
          <div className={style.finishCover}>
            <img className={style.coverPic} src={video.cover} alt={video.title} />
            <div className={style.coverWrapper}>
              <div
                className={style.replay}
                onClick={e => {
                  e.stopPropagation();
                  playOrPause();
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
        }
        { // 直播时，主播不在
          isLive && !isStreaming &&
          <div className={style.noticeCover}>
            <div className={style.noticeWrapper}>
              <i />
              <span>闲置中...</span>
            </div>
          </div>
        }
      </div>
    </div>
  );
}

export { sendBarrage, Player };