import * as React from "react";

import { formatDuration } from "../../../../customed-methods/string";
import Barrage from "../../child-components/barrage/Barrage";

import style from "./control-bar.styl?css-modules";

interface ControlBarProps {
  ctrBarStatus: {
    isLive: boolean,
    isShowControlBar: boolean,
    speedBtnSuffix: string,
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
  },
  ctrBarMethods: {
    playOrPause: () => void,
    changeBar: Function,
    showControlsTemporally: Function,
    setTimeupdateListener: () => void,
    setIsShowControlBar: React.Dispatch<React.SetStateAction<boolean>>,
    setIsShowPlayBtn: React.Dispatch<React.SetStateAction<boolean>>
  },
  ctrBarRefs: {
    controlBarRef: React.RefObject<HTMLDivElement>,
    ctrPlayBtnRef: React.RefObject<HTMLDivElement>,
    pausedRef: React.MutableRefObject<boolean>,
    currentTimeRef: React.RefObject<HTMLSpanElement>,
    progressRef: React.RefObject<HTMLDivElement>,
    videoRef: React.RefObject<HTMLVideoElement>,
    barrageRef: React.RefObject<Barrage>,
    playerRef: React.RefObject<HTMLDivElement>,
    speedRef: React.MutableRefObject<any>,
    liveDurationRef: React.RefObject<HTMLDivElement>
  },
}

const { useState, useEffect, useRef, forwardRef, useImperativeHandle } = React;

function ControlBar(props: ControlBarProps, ref) {
  const { ctrBarStatus, ctrBarData, ctrBarMethods, ctrBarRefs } = props;
  const { isLive, isShowControlBar, speedBtnSuffix } = ctrBarStatus;
  const { video, initBarrages, ctrBarTimer } = ctrBarData;
  const { playOrPause, changeBar, showControlsTemporally,
    setTimeupdateListener, setIsShowControlBar, setIsShowPlayBtn } = ctrBarMethods;
  const { controlBarRef, ctrPlayBtnRef, pausedRef, currentTimeRef, progressRef,
    videoRef, barrageRef, playerRef, speedRef, liveDurationRef } = ctrBarRefs;


  const [isFullscreen, setIsFullscreen] = useState(false);
  const progressWrapperRef: React.RefObject<HTMLDivElement> = useRef(null);
  const progressBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const barrageBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const fullscreenBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const speedBtnRef: React.RefObject<HTMLDivElement> = useRef(null);

  const controlBarStyle: React.CSSProperties = { visibility: isShowControlBar ? "visible" : "hidden" };
  const [showBarrage, setShowBarrage] = useState(true);
  let ctrPlayBtnIconName = pausedRef.current ? "Play" : "Pause";
  let barrageBtnIconName = showBarrage ? "On" : "Off";

  let easeTimer: number;

  useImperativeHandle(ref, () => ({
    setGraduallyHide: (DOM, startTime) => {
      easeTimer = setTimeout(() => {
        DOM.classList.add(style.graduallyHide);
      }, startTime);
      setTimeout(() => {
        DOM.classList.remove(style.graduallyHide);
      }, startTime + 500);
    },
    showBarrage: showBarrage
  }), []);

  function changePlayPosition(e) {
    const progressWrapperDOM = progressRef.current.parentElement;
    const videoDOM = videoRef.current;
    const progress = (e.clientX - progressWrapperDOM.getBoundingClientRect().left) / progressWrapperDOM.offsetWidth;

    videoDOM.currentTime = videoDOM.duration * progress;
    // 重新赋值弹幕列表
    changeBar(initBarrages.slice());
    // 清除跳转前的弹幕
    barrageRef.current.clear();

    if (ctrBarTimer !== 0) { clearTimeout(ctrBarTimer); }
    if (easeTimer !== 0) { clearTimeout(easeTimer); }
    showControlsTemporally();
  }

  // 开启或关闭弹幕
  function onOrOff() {
    if (showBarrage) {
      barrageRef.current.clear();
      setShowBarrage(false);
    } else { setShowBarrage(true); }
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

  function setActivedColor(dom) {
    dom.addEventListener("touchstart", () => { dom.style.color = "#de698c"; })
    dom.addEventListener("touchend", () => { dom.style.color = "#ffffff"; })
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

  useEffect(() => {
    setElesActivedColor();
    setBtnsListener();
    if (!isLive) {
      setProgressDOM();
      setSpeedBtnListener();
    }
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