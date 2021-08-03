import * as React from "react";
import * as dashjs from 'dashjs';
import * as Hls from "hls.js";

import myContext from "@context/index";
import { getBarrages } from "@api/video";

import Speed from "./child-components/speed/Speed"
import LastPosition from "./child-components/last-position/LastPosition"
import Cover from "./child-components/cover/Cover"
import Replay from "./child-components/replay/Replay"
import ControlBar from "./child-components/control-bar/ControlBar"
import Barrage from "./child-components/barrage/Barrage";
import Loading from "./child-components/loading/Loading"
import EditBarr from "./child-components/edit-barr/EditBarr";

import { formatDuration } from "@customed-methods/string";
import style from "./player.styl?css-modules";

interface PlayerProps {
  isLive: boolean, // 该视频是否是直播
  video: {
    aId: number,
    cId: number,
    title: string,
    cover: string,
    duration: number,
    url: string,
    Aurl?: string
  },
  myUid?: number,
  videoRef?: React.RefObject<HTMLVideoElement>,
  isStreaming?: boolean, // 主播是否正在直播
  liveTime?: number,
  clickCover?: Function
}

const { useState, useEffect, useRef, useContext, forwardRef, useImperativeHandle } = React;

function Player(props: PlayerProps, ref) {
  /* 从父组件获取的数据 */
  const { isLive, video, myUid, liveTime, videoRef, clickCover } = props;
  const context = useContext(myContext);

  /* 不需要关联ref的state */
  const [waiting, setWaiting] = useState(false);
  const [finish, setFinish] = useState(false);
  const [isShowPlayBtn, setIsShowPlayBtn] = useState(true);
  const [isStreaming, setIsStreaming] = useState(props.isStreaming);
  const [isShowCenterVolume, setIsShowCenterVolume] = useState(false);
  const [isShowCenterBri, setIsShowCenterBri] = useState(false);
  const [speedBtnSuffix, setSpeedBtnSuffix] = useState("1");
  const [showEditBarr, setShowEditBarr] = useState(false);
  const [barrCoolDown, setbarrCoolDown] = useState(0);
  let ctrBarTimer: number; // 控制鼠标静止一段时间后隐藏控制条的定时器

  /* 需要关联ref的state */
  // 是否显示控制栏
  const [isShowControlBar, setIsShowControlBar] = useState(true);
  const showCtrBarRef = useRef(true);
  useEffect(() => { showCtrBarRef.current = isShowControlBar }, [isShowControlBar]);
  // 暂停/播放
  const [paused, setPaused] = useState(true);
  const pausedRef = useRef(true);
  useEffect(() => { pausedRef.current = paused }, [paused]);
  // 手势类型
  const [gestureType, setGestureType] = useState(0); // 手势类型：0：无手势；1：左右滑动；2：右边的上下滑动；3：左边的上下滑动
  const gestureTypeRef = useRef(0);
  useEffect(() => { gestureTypeRef.current = gestureType }, [gestureType]);
  // 从后端请求到的弹幕数据
  const [initBarrData, setInitBarrData] = useState([]);
  const initBarrDataRef = useRef([]);
  useEffect(() => { initBarrDataRef.current = initBarrData }, [initBarrData]);
  // findBarrages和EditBarr中会对弹幕数据进行修改操作，而原数据在改变播放位置、重新播放等情况时要被再次使用
  // 因此不能在原数据上直接修改，barrForSend就是供修改的原数据copy
  const [barrsForSend, setBarrsForSend] = useState([]);
  const barrsForSendRef = useRef([]);
  useEffect(() => { barrsForSendRef.current = barrsForSend }, [barrsForSend]);

  /* Refs */
  const playerRef: React.RefObject<HTMLDivElement> = useRef(null);
  const playerWrapperRef: React.RefObject<HTMLDivElement> = useRef(null);
  const videoAreaRef: React.RefObject<HTMLDivElement> = useRef(null);
  const barrageRef: React.RefObject<Barrage> = useRef(null);
  const controlBarRef: React.RefObject<HTMLDivElement> = useRef(null);
  const currentTimeRef: React.RefObject<HTMLSpanElement> = useRef(null);
  const progressRef: React.RefObject<HTMLDivElement> = useRef(null);
  const ctrPlayBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const playBtnRef: React.RefObject<HTMLDivElement> = useRef(null);
  const curVolumeRef: React.RefObject<HTMLSpanElement> = useRef(null);
  const curBrightnessRef: React.RefObject<HTMLDivElement> = useRef(null);
  const playBtnTimerRef: React.MutableRefObject<number> = useRef(0);
  const lastPosRef: React.MutableRefObject<JSX.Element> = useRef(null);
  const speedRef: React.MutableRefObject<JSX.Element> = useRef(null);
  const ctrBarRef: React.MutableRefObject<any> = useRef(null);
  const coverRef: React.MutableRefObject<any> = useRef(null);

  /* 样式控制 */
  const centerVolumeStyle: React.CSSProperties = { visibility: isShowCenterVolume ? "visible" : "hidden" };
  const centerBriStyle: React.CSSProperties = { visibility: isShowCenterBri ? "visible" : "hidden" };
  const playBtnStyle: React.CSSProperties = { visibility: isShowPlayBtn ? "visible" : "hidden" };
  const videoStyle: React.CSSProperties = { display: coverRef.current?.isShowCover ? "none" : "block" };
  const playBtnIconName: string = paused ? "play" : "pause";

  /* 需要传递给子组件的props */
  // 将传递给Barrage
  const barrageRefs = {
    videoRef: videoRef,
    curBrightnessRef: curBrightnessRef,
    curVolumeRef: curVolumeRef,
    gesRef: gestureTypeRef,
    progressRef: progressRef,
    currentTimeRef: currentTimeRef,
    showCtrBarRef: showCtrBarRef,
    controlBarRef: controlBarRef
  };
  const barrageSetState = {
    setGestureType: setGestureType,
    setIsShowCenterVolume: setIsShowCenterVolume,
    setIsShowCenterBri: setIsShowCenterBri,
    setIsShowControlBar: setIsShowControlBar
  };
  const barrageMethods = {
    setTimeupdateListener: setTimeupdateListener,
    showControls: showControls,
    showControlsTemporally: showControlsTemporally,
    clearCtrTimer: clearCtrTimer
  };

  function clearCtrTimer() {
    clearTimeout(ctrBarTimer);
  }
  const ctrBarStatus = {
    isLive: isLive,
    isShowControlBar: isShowControlBar,
    speedBtnSuffix: speedBtnSuffix,
    paused: paused,
    showEditBarr: showEditBarr,
    barrCoolDown: barrCoolDown,
  };
  const ctrBarData = {
    video: video,
    initBarrDataRef: initBarrDataRef,
    ctrBarTimer: ctrBarTimer,
    liveTime: liveTime,
  };
  const ctrBarMethods = {
    playOrPause: playOrPause,
    changeBar: barr => { setBarrsForSend(barr) },
    showControlsTemporally: showControlsTemporally,
    clearCtrTimer: clearCtrTimer,
    setTimeupdateListener: setTimeupdateListener,
    setIsShowControlBar: setIsShowControlBar,
    setIsShowPlayBtn: setIsShowPlayBtn,
    setShowEditBarr: setShowEditBarr,
    setbarrCoolDown: setbarrCoolDown
  };
  const ctrBarRefs = {
    controlBarRef: controlBarRef,
    ctrPlayBtnRef: ctrPlayBtnRef,
    currentTimeRef: currentTimeRef,
    progressRef: progressRef,
    videoRef: videoRef,
    barrageRef: barrageRef,
    playerRef: playerRef,
    speedRef: speedRef,
  }

  /* Player的全局变量 */
  // const isIos: boolean;
  // const isAndroid: boolean;
  // isIos = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 只写一个!会报错
  // isAndroid = navigator.userAgent.indexOf('Android') > -1 || navigator.userAgent.indexOf('Adr') > -1;
  // isPC = !isIos && !isAndroid;
  // isPC = !(navigator.userAgent.match(/(iPhone|iPad|iPod|iOS|Android)/i) !== null);

  /* 控制栏相关 */
  function showControls() {
    clearCtrTimer();
    ctrBarRef.current.clearEaseTimer();
    controlBarRef.current.classList.remove(style.graduallyHide);
    setIsShowControlBar(true);
  }

  function showControlsTemporally() {
    const controlBarDOM = controlBarRef.current;
    showControls();
    ctrBarRef.current.setGraduallyHide(controlBarDOM, 2000);
    ctrBarTimer = setTimeout(() => { setIsShowControlBar(false) }, 2500);
  }

  function setTimeupdateListener() {
    const videoDOM = videoRef.current;
    const barrageComponent = barrageRef.current;
    const currentTimeDOM = currentTimeRef.current;
    const progressDOM = progressRef.current;
    const curTime = videoDOM.currentTime;
    // 更新进度条
    currentTimeDOM.innerHTML = formatDuration(curTime, "0#:##");
    progressDOM.style.width = `${curTime / videoDOM.duration * 100}%`;
    // 如果显示弹幕已开，且正在播放
    ctrBarRef.current.showBarrage && !pausedRef.current &&
      findBarrages(curTime).forEach(barrage => barrageComponent.send(barrage));
  }

  /* videoDOM相关 */

  function playOrPause() {
    const videoDOM = videoRef.current;

    if (pausedRef.current) {
      setPaused(false);
      videoDOM.play();
      showControlsTemporally();
      playBtnTimerRef.current = setTimeout(() => { setIsShowPlayBtn(false); }, 800);
      setFinish(false);
    } else {
      setPaused(true);
      videoDOM.pause();
      showControlsTemporally();
      clearTimeout(playBtnTimerRef.current);
      setIsShowPlayBtn(true);
    }
  }

  function setListeners() {
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
      setBarrsForSend(initBarrDataRef.current.slice());
      // 清除弹幕
      barrageRef.current.clear();
    });

    playBtnRef.current.addEventListener("click", e => {
      e.stopPropagation();
      playOrPause();
    });
  }

  const getVideoUrl = url => {
    return `${context.videoURL}?video=${encodeURIComponent(url)}`;
  }

  const createMSE = async (vUrl, aUrl) => {
    const videoDOM: HTMLVideoElement = videoRef.current;
    const source = new MediaSource();
    const getFileBuffer = url => {
      return fetch(url).then(resp => resp.arrayBuffer());
    }
    const waitForEvent = (target, event) => {
      return new Promise(res => {
        target.addEventListener(event, res, { once: true });
      });
    }

    videoDOM.src = URL.createObjectURL(source);
    source.addEventListener('sourceopen', () => URL.revokeObjectURL(videoDOM.src))

    const vArrBuf = await getFileBuffer(vUrl);
    const aArrBuf = await getFileBuffer(aUrl);
    const videoBuf = source.addSourceBuffer("video/mp4;codecs=avc1.640032");
    videoBuf.appendBuffer(vArrBuf);
    const audioBUf = source.addSourceBuffer("audio/mp4;codecs=mp4a.40.2");
    audioBUf.appendBuffer(aArrBuf);

    await Promise.all([
      waitForEvent(audioBUf, "updateend"),
      waitForEvent(videoBuf, "updateend")
    ]);
    source.endOfStream();
  }

  function setLiveVideoDOM() {
    const videoDOM: HTMLVideoElement = videoRef.current;
    const { video } = props;

    // 支持m3u8，直接使用video播放
    if (videoDOM.canPlayType("application/vnd.apple.mpegurl")) {
      videoDOM.src = video.url;
      videoDOM.addEventListener("canplay", () => videoDOM.play());
      videoDOM.addEventListener("error", () => setIsStreaming(false));
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(video.url);
      hls.attachMedia(videoDOM);
      hls.on(Hls.Events.MANIFEST_PARSED, () => videoDOM.play());
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR || data.response?.code === 404) {
          setIsStreaming(false)
        }
      }
      );
    }
  }

  /* 弹幕相关 */
  function setBarr() {
    getBarrages(video.cId).then(result => {
      const { code, data } = result;
      if (code === "1") {
        // 初始化弹幕列表
        setInitBarrData(data);
        setBarrsForSend(data);
      }
    });
  }

  //  根据时间查找弹幕
  function findBarrages(time) {
    // 查找到的弹幕
    const temp = [];
    // 查找到的弹幕索引
    const indexs = [];
    barrsForSendRef.current.forEach((barrage, index) => {
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
    indexs.forEach((index, i) => barrsForSendRef.current.splice(index - i, 1));
    return temp;
  }

  useImperativeHandle(ref, () => ({
    sendBarrage: data => {
      if (ctrBarRef.current.showBarrage) {
        barrageRef.current.send({
          type: "1",
          decimalColor: data.color,
          content: data.content,
          sendTime: data.sendTime,
          isMineBarr: data.isMineBarr,
          uidHash: data.uidHash,
          size: data.size
        });
      }
    }
  }), []);

  useEffect(() => {
    if (isLive) {
      setLiveVideoDOM();
      videoRef.current.autoplay = true;
    } else {
      createMSE(`${context.videoURL}?video=${encodeURIComponent(video.url)}`, `${context.videoURL}?video=${encodeURIComponent(video.Aurl)}`);
      setListeners();
      setBarr();
    }
    return () => videoRef.current.removeEventListener("timeupdate", setTimeupdateListener);
  }, []);

  return (
    <div className={style.videoPlayer} ref={playerRef}>
      {/* 视频区域 */}
      <div className={style.playerWrapper} ref={playerWrapperRef}>
        <div className={style.videoArea} ref={videoAreaRef}>
          <video height="100%" width="100%" preload="auto" style={videoStyle}
            ref={videoRef}
            // playsinline是解决ios默认打开网页的时候，会自动全屏播放
            x5-playsinline="true" playsInline={true}
          // src={isLive ? "" : `${context.videoURL}?video=${encodeURIComponent(video.url)}`}
          >
            {/* <source src={isLive ? "" : `${context.videoURL}?video=${encodeURIComponent(video.url)}`} /> */}
            {/* <source src={isLive ? "" : `${context.videoURL}?video=${encodeURIComponent(video.Aurl)}`} /> */}
          </video>
        </div>
        {/* 弹幕 */}
        {/* 不把Barrage放进videoArea中是因为： */}
        {/*   如果Barrage成为videoArea的子元素，那么Barrage的事件会冒泡到videoArea */}
        {/*   这样就还要阻止Barrage的事件冒泡，所以不如将其放在外面 */}
        <div className={style.barrage}>
          <Barrage isLive={isLive} barrageRefs={barrageRefs} myUid={myUid?.toString()}
            barrageSetState={barrageSetState} barrageMethods={barrageMethods}
            opacity={isLive ? 1 : 0.75} ref={barrageRef} paused={paused} oid={video.cId}
          />
        </div>
        <div className={style.controlContainer}>
          {/* 是否跳转到上次播放位置 */}
          {!isLive && <LastPosition video={video} videoRef={videoRef} ref={lastPosRef} />}
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
          {!isLive &&
            <div className={style.speedContainer} >
              <Speed videoDOM={videoRef.current} paused={paused} ref={speedRef}
                playBtnTimer={playBtnTimerRef.current} isShowPlayBtn={isShowPlayBtn}
                setIsShowPlayBtn={setIsShowPlayBtn} setSpeedBtnSuffix={setSpeedBtnSuffix}
              />
            </div>
          }
          {/* 右边的白色播放暂停按钮 */}
          {!isLive &&
            <div className={style.playButton} style={playBtnStyle} ref={playBtnRef}>
              <svg className="icon" aria-hidden="true">
                <use href={`#icon-${playBtnIconName}`}></use>
              </svg>
            </div>
          }
          {/* 控制栏 */}
          <ControlBar ctrBarStatus={ctrBarStatus} ctrBarData={ctrBarData} ref={ctrBarRef}
            ctrBarMethods={ctrBarMethods} ctrBarRefs={ctrBarRefs}
          />
          {/* 编辑待发送弹幕 */}
          <EditBarr showEditBarr={showEditBarr} setShowEditBarr={setShowEditBarr}
            videoData={video} videoRef={videoRef} barrsForSendRef={barrsForSendRef}
            setbarrCoolDown={setbarrCoolDown}
          />
        </div>
        {/* 封面 */}
        <Cover ref={coverRef} isLive={isLive} video={video}
          playOrPause={playOrPause} lastPosRef={lastPosRef} setWaiting={setWaiting}
          videoRef={videoRef} setPaused={setPaused} clickCover={clickCover}
        />
        {/* 正在缓冲 */}
        {waiting && <Loading isLive={isLive} />}
        {/* 重新播放 */}
        {finish && <Replay video={video} playOrPause={playOrPause} />}
        {/* 直播时，主播不在 */}
        {isLive && !isStreaming &&
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

export default forwardRef(Player);
