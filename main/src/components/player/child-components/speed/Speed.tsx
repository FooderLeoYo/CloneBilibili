import * as React from "react";
import style from "./Speed.styl?css-modules";

interface SpeedProps {
  videoDOM: HTMLVideoElement,
  paused: boolean,
  playBtnTimer: number,
  isShowPlayBtn: boolean,
  setIsShowPlayBtn: Function,
  setSpeedBtnSuffix: Function,
}

const { useState, useRef, useImperativeHandle, forwardRef } = React;

const Speed = forwardRef((props: SpeedProps, ref: React.MutableRefObject<any>) => {
  const { videoDOM, paused, playBtnTimer, isShowPlayBtn, setIsShowPlayBtn,
    setSpeedBtnSuffix } = props;

  const [showCenterSpeed, setShowCenterSpeed] = useState(false);
  const [showSpeedBar, setShowSpeedBar] = useState(false);
  const [centerSpeed, setCenterSpeed] = useState(1);

  const speedBarRef: React.RefObject<HTMLUListElement> = useRef(null);

  const centerSpeedStyle: React.CSSProperties = { visibility: showCenterSpeed ? "visible" : "hidden" };
  // 注意这里设置显示不能是block，因为会覆盖掉css中的grid
  // 所以直接设成grid，css还可以省去display: grid
  const speedBarStyle: React.CSSProperties = { display: showSpeedBar ? "grid" : "none" };

  let SpeedEaseTimer: number;

  function showPlayBtn() {
    if (playBtnTimer !== 0) { clearTimeout(playBtnTimer); }
    if (!isShowPlayBtn) { setIsShowPlayBtn(true); }
  }

  function setPlaySpeed(speed) {
    videoDOM.playbackRate = speed;

    setCenterSpeed(speed);
    setShowCenterSpeed(true);
    if (paused) { showPlayBtn(); }
    setTimeout(() => { setShowCenterSpeed(false); }, 1000);

    // btnPlaySpeed不能直接用speed，因为iconfont命名不允许有小数点
    switch (speed) {
      case 0.5:
        setSpeedBtnSuffix("0point5");
        break;
      case 0.75:
        setSpeedBtnSuffix("0point75");
        break;
      case 1:
        setSpeedBtnSuffix("1");
        break;
      case 1.5:
        setSpeedBtnSuffix("1point5");
        break;
      case 2:
        setSpeedBtnSuffix("2");
        break;
    }
  }

  function setGraduallyHide(DOM, startTime) {
    SpeedEaseTimer = setTimeout(() => {
      DOM.classList.add(style.graduallyHide);
    }, startTime);
    setTimeout(() => {
      DOM.classList.remove(style.graduallyHide);
    }, startTime + 500);
  }

  useImperativeHandle(ref, () => ({
    showSpeedBarTemporally: () => {
      clearTimeout(SpeedEaseTimer);
      setShowSpeedBar(true);
      setGraduallyHide(speedBarRef.current, 2000);
      setTimeout(() => { setShowSpeedBar(false); }, 2500);
    }
  }), []);

  return (
    <div className={style.speedWrapper}>
      <span
        className={style.centerSpeed}
        style={centerSpeedStyle}
      >{`${centerSpeed}x`}
      </span>
      <div className={style.speedBarWrapper}>
        <ul className={style.speedBar} style={speedBarStyle} ref={speedBarRef}>
          <li
            style={{ color: centerSpeed === 0.5 ? "#de698c" : "#ffffff" }}
            onClick={e => {
              e.stopPropagation();
              setPlaySpeed(0.5);
              setShowSpeedBar(false);
            }}
            key={0.5}
          >{0.5}</li>
          <li
            style={{ color: centerSpeed === 0.75 ? "#de698c" : "#ffffff" }}
            onClick={e => {
              e.stopPropagation();
              setPlaySpeed(0.75);
              setShowSpeedBar(false);
            }}
            key={0.75}
          >{0.75}</li>
          <li
            style={{ color: centerSpeed === 1 ? "#de698c" : "#ffffff" }}
            onClick={e => {
              e.stopPropagation();
              setPlaySpeed(1);
              setShowSpeedBar(false);
            }}
            key={1}
          >{1}</li>
          <li
            style={{ color: centerSpeed === 1.5 ? "#de698c" : "#ffffff" }}
            onClick={e => {
              e.stopPropagation();
              setPlaySpeed(1.5);
              setShowSpeedBar(false);
            }}
            key={1.5}
          >{1.5}</li>
          <li
            style={{ color: centerSpeed === 2 ? "#de698c" : "#ffffff" }}
            onClick={e => {
              e.stopPropagation();
              setPlaySpeed(2);
              setShowSpeedBar(false);
            }}
            key={2}
          >{2}</li>
        </ul>
      </div>
    </div>
  )
});

export default Speed;
