import * as React from "react";
import { Link } from "react-router-dom";

import { getNavUserInfo } from "@api/login";
import { formatDuration } from "@customed-methods/string";
import Barrage from "../../child-components/barrage/Barrage";
import style from "./control-bar.styl?css-modules";

interface ControlBarProps {
  ctrBarStatus: {
    isLive: boolean,
    isShowControlBar: boolean,
    speedBtnSuffix: string,
    paused: boolean,
    showEditBarr: boolean,
    barrCoolDown: number,
  };
  ctrBarData: {
    video: {
      aId: number,
      cId: number,
      title: string,
      cover: string,
      duration: number,
      url: string
    };
    initBarrDataRef: React.MutableRefObject<any[]>,
    ctrBarTimer: number,
    liveTime: number,
  };
  ctrBarMethods: {
    setIsShowControlBar: React.Dispatch<React.SetStateAction<boolean>>,
    setIsShowPlayBtn: React.Dispatch<React.SetStateAction<boolean>>,
    playOrPause: () => void,
    changeBar: Function,
    showControlsTemporally: Function,
    clearCtrTimer: () => void,
    setTimeupdateListener: () => void,
    setShowEditBarr: React.Dispatch<React.SetStateAction<boolean>>,
    setbarrCoolDown: React.Dispatch<React.SetStateAction<number>>
  };
  ctrBarRefs: {
    controlBarRef: React.RefObject<HTMLDivElement>,
    ctrPlayBtnRef: React.RefObject<HTMLDivElement>,
    currentTimeRef: React.RefObject<HTMLSpanElement>,
    progressRef: React.RefObject<HTMLDivElement>,
    videoRef: React.RefObject<HTMLVideoElement>,
    barrageRef: React.RefObject<Barrage>,
    playerRef: React.RefObject<HTMLDivElement>,
    speedRef: React.MutableRefObject<any>,
  };
}

const { useState, useEffect, useRef, forwardRef, useImperativeHandle } = React;

function ControlBar(props: ControlBarProps, ref) {
  const { ctrBarStatus, ctrBarData, ctrBarMethods, ctrBarRefs } = props;
  const { isLive, isShowControlBar, speedBtnSuffix, paused, showEditBarr,
    barrCoolDown } = ctrBarStatus;
  const { video, initBarrDataRef, ctrBarTimer, liveTime } = ctrBarData;
  const { setIsShowControlBar, setIsShowPlayBtn, playOrPause, changeBar, showControlsTemporally, clearCtrTimer,
    setTimeupdateListener, setShowEditBarr, setbarrCoolDown } = ctrBarMethods;
  const { controlBarRef, ctrPlayBtnRef, currentTimeRef, progressRef,
    videoRef, barrageRef, playerRef, speedRef } = ctrBarRefs;

  const [isLogin, setIsLogin] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isFullRef = useRef(isFullscreen);
  useEffect(() => { isFullRef.current = isFullscreen }, [isFullscreen]);

  const progressWrapperRef: React.RefObject<HTMLDivElement> = useRef(null);
  const progressBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const barrageBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const fullscreenBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const speedBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const liveDurationRef: React.RefObject<HTMLDivElement> = useRef(null);

  const controlBarStyle: React.CSSProperties = { visibility: isShowControlBar ? "visible" : "hidden" };
  const ctrPlayBtnIconName = paused ? "Play" : "Pause";

  let easeTimer: number;

  function changePlayPosition(e) {
    const progressWrapperDOM = progressRef.current.parentElement;
    const videoDOM = videoRef.current;
    const progress = (e.clientX - progressWrapperDOM.getBoundingClientRect().left) / progressWrapperDOM.offsetWidth;
    // 调整时间
    videoDOM.currentTime = videoDOM.duration * progress;
    // 重新赋值弹幕列表
    changeBar(initBarrDataRef.current.slice());
    // 清除跳转前的弹幕
    barrageRef.current.clear();
    // 清除定时器
    ctrBarTimer !== 0 && clearCtrTimer();
    easeTimer !== 0 && clearTimeout(easeTimer);
    // 显示控制条
    showControlsTemporally();
  }

  // 弹幕开关
  const [showBarr, setShowBarr] = useState(true);
  const showBarrRef = useRef(showBarr);
  useEffect(() => { showBarrRef.current = showBarr; }, [showBarr]);
  const barrageBtnIconName = showBarr ? "On" : "Off";
  function onOrOff() {
    showBarrRef.current && barrageRef.current.clear();
    setShowBarr(!showBarrRef.current);
  }

  function entryOrExitFullscreen() {
    const playerDOM: any = playerRef.current;
    // const videoAreaWrapperDOM = videoAreaWrapperRef.current;

    if (isFullRef.current) {
      const doc: any = document;
      setIsFullscreen(false);
      // videoAreaWrapperDOM.classList.remove(style.fullScreen);
      if (doc.exitFullscreen) { doc.exitFullscreen() }
      else if (doc.mozCancelFullScreen) { doc.mozCancelFullScreen() }
      else if (doc.webkitCancelFullScreen) { doc.webkitCancelFullScreen() }
      else if (doc.msExitFullscreen) { doc.msExitFullscreen() }
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
      if (rate > 1 || rate < 0) { return } // 滑动到了进度条以外
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
    DOM.addEventListener("touchstart", () => DOM.style.color = "#de698c")
    DOM.addEventListener("touchend", () => DOM.style.color = "#ffffff")
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
    showBarrage: showBarr,
    setGraduallyHide: (DOM, startTime) => {
      easeTimer = setTimeout(() => {
        DOM.classList.add(style.graduallyHide);
      }, startTime);
      setTimeout(() => {
        DOM.classList.remove(style.graduallyHide);
      }, startTime + 500);
    },
    clearEaseTimer: () => clearTimeout(easeTimer)
  }), [showBarr])

  useEffect(() => {
    getNavUserInfo().then(result => result.data.data.isLogin && setIsLogin(true));
    setElesActivedColor();
    setBtnsListener();
    if (!isLive) {
      setProgressDOM();
      setSpeedBtnListener();
    } else { liveTime && setLiveDurationDOM() }
  }, []);

  const barrCoolDownRef = useRef(null);
  useEffect(() => { barrCoolDownRef.current = barrCoolDown }, [barrCoolDown]);
  useEffect(() => {
    const handleInterval = () => {
      const curCount = barrCoolDownRef.current - 1;
      setbarrCoolDown(curCount);
      curCount === 0 && clearInterval(coolTimer);
    }
    let coolTimer;
    if (barrCoolDown === 5) {
      coolTimer = setInterval(() => handleInterval(), 1000)
    }
  }, [barrCoolDown]);

  return (
    <div className={style.controlBar} style={controlBarStyle} ref={controlBarRef}>
      {isLive ? <div className={style.liveDuration} ref={liveDurationRef} /> :
        <div className={style.progressBar}>
          <span className={style.curTime} ref={currentTimeRef}>00:00</span>
          <div className={style.progressWrapper} ref={progressWrapperRef}>
            <div className={style.progress} ref={progressRef} >
              <span className={style.progressBtn} ref={progressBtnRef} />
            </div>
          </div>
          <span className={style.totalTime}>{formatDuration(video.duration, "0#:##")}</span>
        </div>
      }
      <div className={style.ctrBarBottom}>
        {/* 控制栏播放按钮 */}
        <div className={style.controlBarPlayBtn} ref={ctrPlayBtnRef}>
          <svg className="icon" aria-hidden="true">
            <use href={`#icon-ctr${ctrPlayBtnIconName}`}></use>
          </svg>
        </div>
        {/* 弹幕开关 */}
        <div className={style.barrageBtn} ref={barrageBtnRef}>
          <svg className="icon" aria-hidden="true">
            <use href={`#icon-barrage${barrageBtnIconName}`}></use>
          </svg>
        </div>
        <div className={style.sendBarr}>
          {isLogin ?
            <span onClick={() => !showEditBarr && barrCoolDown === 0 && setShowEditBarr(true)}>
              {showEditBarr ? "弹幕编辑中……" : barrCoolDown === 0 ?
                "发个友好的弹幕见证当下" : `${barrCoolDown}秒后可再次发送`
              }
            </span> :
            <span className={style.login}>想弹幕吐槽一下？快去&nbsp;<Link to="/login">登录/注册</Link>&nbsp;吧！</span>
          }
        </div>
        {/* 调节播放速度 */}
        {!isLive &&
          <div className={style.speedBtn} ref={speedBtnRef} >
            <svg className="icon" aria-hidden="true">
              <use href={`#icon-speed${speedBtnSuffix}`}></use>
            </svg>
          </div>
        }
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
