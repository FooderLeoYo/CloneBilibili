import * as React from "react";

import { formatDuration } from "../../../../customed-methods/string";
import Barrage from "../../child-components/barrage/Barrage";

import style from "./control-bar.styl?css-modules";

interface ControlBarProps {
  ctrBarStatus: {
    isLive: boolean,
    isShowControlBar: boolean,
    speedBtnSuffix: string,
    paused: boolean
  },
  ctrBarData: {
    video: {
      aId: number,
      cId: number,
      title: string,
      cover: string,
      duration: number,
      url: string
    },
    initBarrages: any[],
    ctrBarTimer: number,
    liveTime: number
  },
  ctrBarMethods: {
    setIsShowControlBar: React.Dispatch<React.SetStateAction<boolean>>,
    setIsShowPlayBtn: React.Dispatch<React.SetStateAction<boolean>>,
    playOrPause: () => void,
    changeBar: Function,
    showControlsTemporally: Function,
    clearCtrTimer: () => void,
    setTimeupdateListener: () => void,
  },
  ctrBarRefs: {
    controlBarRef: React.RefObject<HTMLDivElement>,
    ctrPlayBtnRef: React.RefObject<HTMLDivElement>,
    currentTimeRef: React.RefObject<HTMLSpanElement>,
    progressRef: React.RefObject<HTMLDivElement>,
    videoRef: React.RefObject<HTMLVideoElement>,
    barrageRef: React.RefObject<Barrage>,
    playerRef: React.RefObject<HTMLDivElement>,
    speedRef: React.MutableRefObject<any>,
  },
}

const { useState, useEffect, useRef, forwardRef, useImperativeHandle } = React;

function ControlBar(props: ControlBarProps, ref) {
  const { ctrBarStatus, ctrBarData, ctrBarMethods, ctrBarRefs } = props;
  const { isLive, isShowControlBar, speedBtnSuffix, paused } = ctrBarStatus;
  const { video, initBarrages, ctrBarTimer, liveTime } = ctrBarData;
  const { setIsShowControlBar, setIsShowPlayBtn, playOrPause, changeBar, showControlsTemporally, clearCtrTimer,
    setTimeupdateListener } = ctrBarMethods;
  const { controlBarRef, ctrPlayBtnRef, currentTimeRef, progressRef,
    videoRef, barrageRef, playerRef, speedRef } = ctrBarRefs;

  const progressWrapperRef: React.RefObject<HTMLDivElement> = useRef(null);
  const progressBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const barrageBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const fullscreenBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const speedBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const liveDurationRef: React.RefObject<HTMLDivElement> = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const isFullRef = useRef(isFullscreen);
  if (isFullRef.current !== isFullscreen) { isFullRef.current = isFullscreen; }

  const controlBarStyle: React.CSSProperties = { visibility: isShowControlBar ? "visible" : "hidden" };
  const ctrPlayBtnIconName = paused ? "Play" : "Pause";

  let easeTimer: number;

  function changePlayPosition(e) {
    const progressWrapperDOM = progressRef.current.parentElement;
    const videoDOM = videoRef.current;
    const progress = (e.clientX - progressWrapperDOM.getBoundingClientRect().left) / progressWrapperDOM.offsetWidth;

    videoDOM.currentTime = videoDOM.duration * progress;
    // 重新赋值弹幕列表
    changeBar(initBarrages.slice());
    // 清除跳转前的弹幕
    barrageRef.current.clear();

    if (ctrBarTimer !== 0) { clearCtrTimer(); }
    if (easeTimer !== 0) { clearTimeout(easeTimer); }
    showControlsTemporally();
  }

  // 弹幕开关
  const [showBarr, setShowBarr] = useState(true);
  const showBarrRef = useRef(showBarr);
  useEffect(() => { showBarrRef.current = showBarr; }, [showBarr]);
  const barrageBtnIconName = showBarr ? "On" : "Off";
  function onOrOff() {
    if (showBarrRef.current) { barrageRef.current.clear(); }
    setShowBarr(!showBarrRef.current);
  }

  function entryOrExitFullscreen() {
    const playerDOM: any = playerRef.current;
    // const videoDOM: any = videoRef.current;
    // const videoAreaWrapperDOM = videoAreaWrapperRef.current;

    if (isFullRef.current) {
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
      if (ctrBarTimer !== 0) { clearCtrTimer(); }
      if (easeTimer !== 0) { clearTimeout(easeTimer); }
      videoDOM.removeEventListener("timeupdate", setTimeupdateListener);
    });

    progressBtnDOM.addEventListener("touchmove", e => {
      e.stopPropagation();
      e.preventDefault(); // 阻止屏幕被拖动
      // 计算拖拽进度比例
      rate = (e.targetTouches[0].pageX - progressLeft) / progressWidth;
      if (rate > 1 || rate < 0) { return; } // 滑动到了进度条以外
      else { // 进度条以内
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

  function setActivedColor(DOM) {
    DOM.addEventListener("touchstart", () => { DOM.style.color = "#de698c"; })
    DOM.addEventListener("touchend", () => { DOM.style.color = "#ffffff"; })
  }

  function setElesActivedColor() {
    setActivedColor(ctrPlayBtnRef.current);
    setActivedColor(barrageBtnRef.current);
    setActivedColor(fullscreenBtnRef.current);
    if (!isLive) { setActivedColor(speedBtnRef.current); }
  }

  function setBtnsListener() {
    ctrPlayBtnRef.current.addEventListener("click", e => {
      e.stopPropagation();
      playOrPause();
    });
    barrageBtnRef.current.addEventListener("click", e => {
      e.stopPropagation();
      onOrOff();
    });
    fullscreenBtnRef.current.addEventListener("click", e => {
      e.stopPropagation();
      entryOrExitFullscreen();
    });
  }

  function setSpeedBtnListener() {
    speedBtnRef.current.addEventListener("click", e => {
      e.stopPropagation();
      speedRef.current.showSpeedBarTemporally();
      setIsShowControlBar(false);
      setIsShowPlayBtn(false);
    })
  }

  function setLiveDurationDOM() {
    const liveDurationDOM = liveDurationRef.current;
    let liveDuration = (new Date().getTime() - liveTime) / 1000;
    liveDurationDOM.innerHTML = formatDuration(liveDuration, "0#:##:##");
    setInterval(() => {
      liveDuration += 1;
      liveDurationDOM.innerHTML = formatDuration(liveDuration, "0#:##:##");
    }, 1000);
  }

  useImperativeHandle(ref, () => ({
    setGraduallyHide: (DOM, startTime) => {
      easeTimer = setTimeout(() => {
        DOM.classList.add(style.graduallyHide);
      }, startTime);
      setTimeout(() => {
        DOM.classList.remove(style.graduallyHide);
      }, startTime + 500);
    },
    showBarrage: showBarr,
    clearEaseTimer: () => {
      clearTimeout(easeTimer);
    }
  }), [showBarr])

  useEffect(() => {
    setElesActivedColor();
    setBtnsListener();
    if (!isLive) {
      setProgressDOM();
      setSpeedBtnListener();
    } else { if (liveTime) { setLiveDurationDOM(); } }
  }, []);

  return (
    <div
      className={style.controlBar + (isLive ? " " + style.liveControl : "")}
      style={controlBarStyle}
      ref={controlBarRef}
    >
      {/* 控制栏播放按钮 */}
      <div className={style.controlBarPlayBtn} ref={ctrPlayBtnRef}>
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
          !isLive &&
          <div className={style.speedBtn} ref={speedBtnRef} >
            <svg className="icon" aria-hidden="true">
              <use href={`#icon-speed${speedBtnSuffix}`}></use>
            </svg>
          </div>
        }
        {/* 弹幕开关 */}
        <div className={style.barrageBtn} ref={barrageBtnRef}>
          <svg className="icon" aria-hidden="true">
            <use href={`#icon-barrage${barrageBtnIconName}`}></use>
          </svg>
        </div>
        {/* 全屏开关 */}
        <div className={style.fullscreenBtn} ref={fullscreenBtnRef}>
          <svg className="icon" aria-hidden="true">
            <use href="#icon-fullscreenBtn"></use>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default forwardRef(ControlBar);