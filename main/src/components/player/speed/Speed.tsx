import * as React from "react";
import style from "./Speed.styl?css-modules";

interface SpeedProps {
  videoDOM: HTMLVideoElement,
  paused: boolean,
  playBtnTimer: number,
  isShowPlayBtn: boolean,
}

const { useState } = React;


function Speed(props: SpeedProps) {
  // const { videoDOM, paused, playBtnTimer, isShowPlayBtn } = props;
  // const [showCenterSpeed, setShowCenterSpeed] = useState(false);
  // const [showSpeedBar, setShowSpeedBar] = useState(false);
  // const [centerSpeed, setCenterSpeed] = useState(1);

  // const centerSpeedStyle = { display: showCenterSpeed ? "block" : "none" };/*  */
  // // 注意这里设置显示不能是block，因为会覆盖掉css中的grid
  // // 所以直接设成grid，css还可以省去display: grid
  // const speedBarStyle = { display: showSpeedBar ? "grid" : "none" };

  // function showPlayBtn() {
  //   if (playBtnTimer !== 0) { clearTimeout(playBtnTimer); }

  //   if (!isShowPlayBtn) {
  //     setState({ isShowPlayBtn: true });
  //   }
  // }

  // function setPlaySpeed(speed) {
  //   videoDOM.playbackRate = speed;

  //   setCenterSpeed(speed);
  //   setShowCenterSpeed(true);
  //   if (paused) {
  //     showPlayBtn();
  //   }
  //   setTimeout(() => { setShowCenterSpeed(false); }, 1000);

  //   // btnPlaySpeed不能直接用speed，因为iconfont命名不允许有小数点
  //   switch (speed) {
  //     case 0.5:
  //       speedBtnSuffix = "0point5";
  //       break;
  //     case 0.75:
  //       speedBtnSuffix = "0point75";
  //       break;
  //     case 1:
  //       speedBtnSuffix = "1";
  //       break;
  //     case 1.5:
  //       speedBtnSuffix = "1point5";
  //       break;
  //     case 2:
  //       speedBtnSuffix = "2";
  //       break;
  //   }
  // }

  // return (
  //   <>
  //     <span
  //       className={style.centerSpeed}
  //       style={centerSpeedStyle}
  //     >{`${centerSpeed}x`}
  //     </span>
  //     <div className={style.speedBarWrapper}>
  //       <ul
  //         className={style.speedBar} style={speedBarStyle} ref={speedBarRef}
  //       >
  //         <li
  //           style={{ color: centerSpeed === 0.5 ? "#de698c" : "#ffffff" }}
  //           onClick={e => {
  //             e.stopPropagation();
  //             setPlaySpeed(0.5);
  //             setShowSpeedBar(false);
  //           }}
  //           key={0.5}
  //         >{0.5}</li>
  //         <li
  //           style={{ color: centerSpeed === 0.75 ? "#de698c" : "#ffffff" }}
  //           onClick={e => {
  //             e.stopPropagation();
  //             setPlaySpeed(0.75);
  //             setShowSpeedBar(false);
  //           }}
  //           key={0.75}
  //         >{0.75}</li>
  //         <li
  //           style={{ color: centerSpeed === 1 ? "#de698c" : "#ffffff" }}
  //           onClick={e => {
  //             e.stopPropagation();
  //             setPlaySpeed(1);
  //             setState({ isShowSpeedBar: false });
  //           }}
  //           key={1}
  //         >{1}</li>
  //         <li
  //           style={{ color: centerSpeed === 1.5 ? "#de698c" : "#ffffff" }}
  //           onClick={e => {
  //             e.stopPropagation();
  //             setPlaySpeed(1.5);
  //             setShowSpeedBar(false);
  //           }}
  //           key={1.5}
  //         >{1.5}</li>
  //         <li
  //           style={{ color: centerSpeed === 2 ? "#de698c" : "#ffffff" }}
  //           onClick={e => {
  //             e.stopPropagation();
  //             setPlaySpeed(2);
  //             setShowSpeedBar(false);
  //           }}
  //           key={2}
  //         >{2}</li>
  //       </ul>
  //     </div>
  //   </>
  // )
}

export default Speed;
