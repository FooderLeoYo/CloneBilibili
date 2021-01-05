import * as React from "react";
import style from "./control-bar.styl?css-modules";

interface ControlBarProps {
  isLive: boolean,
  video: {
    aId: number,
    cId: number,
    title: string,
    cover: string,
    duration: number,
    url: string
  },
  playOrPause: () => void,
}

const { useState, useRef, forwardRef, useImperativeHandle } = React;

function ControlBar(props: ControlBarProps, ref) {
  const { isLive, video, playOrPause } = props;

  const [isShowControlBar, setIsShowControlBar] = useState(true);
  const showCtrBarRef = useRef(isShowControlBar);
  if (showCtrBarRef.current !== isShowControlBar) {
    showCtrBarRef.current = isShowControlBar;
  }
  useImperativeHandle(ref, () => ({
    setIsShowControlBar: arg => {
      setIsShowControlBar(arg);
    }
  }), []);

  const controlBarStyle: React.CSSProperties = { visibility: isShowControlBar ? "visible" : "hidden" };

  return (
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
          !isLive &&
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
  );
}

export default forwardRef(ControlBar);