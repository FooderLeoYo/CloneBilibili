import * as React from "react";

import { formatDuration } from "@customed-methods/string";

import style from "./cover.styl?css-modules";

interface CoverProps {
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
  lastPosRef: React.MutableRefObject<any>,
  setWaiting: React.Dispatch<React.SetStateAction<boolean>>,
  videoRef: React.RefObject<HTMLVideoElement>,
  setPaused: React.Dispatch<React.SetStateAction<boolean>>,
  clickCover?: Function
}

const { useState, useEffect, useRef, forwardRef, useImperativeHandle } = React;

function Cover(props: CoverProps, ref) {
  const { isLive, video, playOrPause, lastPosRef, setWaiting, videoRef,
    setPaused, clickCover } = props;
  const [isShowCover, setIsShowCover] = useState(true);
  const playBtnCoverRef: React.RefObject<HTMLDivElement> = useRef(null);
  const coverStyle = { display: isShowCover ? "block" : "none" };

  function setThumbnailListener() {
    const videoDOM = videoRef.current;
    function setPlayState() {
      setIsShowCover(false);
      setPaused(false);
      setWaiting(false);
    }

    videoDOM.addEventListener("playing", setPlayState);
    // videoDOM.addEventListener("waiting", () => { setWaiting(true); });
    // "play"是HTML DOM 事件onplay的事件类型，而不是一个自定义名称
    if (!isLive) {
      videoDOM.addEventListener("play", setPlayState);
      playBtnCoverRef.current.addEventListener("click", e => {
        e.stopPropagation();
        playOrPause();
        lastPosRef.current.hideLastPosLater();
        clickCover();
      });
    }
  }

  useImperativeHandle(ref, () => ({ isShowCover: isShowCover }), [isShowCover])

  useEffect(() => setThumbnailListener(), []);

  return (
    <div className={style.cover} style={coverStyle}>
      {!isLive ?
        <>
          <div className={style.title}>av{video.aId}</div>
          <img className={style.pic} src={video.cover} alt={video.title} />
          <div className={style.prePlay}>
            <div className={style.duration}>{formatDuration(video.duration, "0#:##:##")}</div>
            <div className={style.playBtn} ref={playBtnCoverRef}>
              <svg className="icon" aria-hidden="true">
                <use href="#icon-play"></use>
              </svg>
            </div>
          </div>
        </> : <img className={style.pic} src={video.cover} alt={video.title} />
      }
    </div>
  )
}

export default forwardRef(Cover);
