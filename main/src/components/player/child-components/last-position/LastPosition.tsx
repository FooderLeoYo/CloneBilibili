import * as React from "react";

import storage from "../../../../customed-methods/storage";
import { formatDuration } from "../../../../customed-methods/string";
import style from "./last-position.styl?css-modules";

interface LastPositionProps {
  video: {
    aId: number,
    cId: number,
    title: string,
    cover: string,
    duration: number,
    url: string
  },
  videoRef: React.RefObject<HTMLVideoElement>
}

const { useEffect, useRef, useState, forwardRef, useImperativeHandle } = React;

function LastPosition(props: LastPositionProps, ref: React.MutableRefObject<any>) {
  const { video, videoRef } = props;

  const lastPosWrapperRef: React.RefObject<HTMLDivElement> = useRef(null);
  const jumpRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [lastPlayPos, setLastPlayPos] = useState(0);
  const videoDOM: HTMLVideoElement = videoRef.current;

  useImperativeHandle(ref, () => ({
    hideLastPos: () => {
      setTimeout(() => {
        lastPosWrapperRef.current.classList.add(style.graduallyHide);
      }, 5000);
    }
  }), [])

  useEffect(() => {
    const targetHistory = storage.getPlayPositionHistory().
      find(v => v.aId === video.aId);
    // 如果是不是第一次打开该视频，才执行相关操作
    if (targetHistory) { setLastPlayPos(targetHistory.position); }
  }, []);

  const jumpDOM = jumpRef.current;
  useEffect(() => {
    if (jumpDOM) {
      jumpDOM.addEventListener("click", () => {
        videoDOM.currentTime = lastPlayPos;
      });
    }
  }, [jumpDOM?.className]);


  useEffect(() => {
    if (videoDOM) {
      return () => {
        storage.setPlayPositionHistory({
          aId: props.video.aId,
          position: videoDOM.currentTime
        });
      }
    }
  }, [videoDOM?.height]);

  return (
    <>
      {
        lastPlayPos !== 0 && <div
          className={style.lastPosWrapper}
          ref={lastPosWrapperRef}
        >
          <span className={style.lastPos}>
            {`记忆您上次看到${formatDuration(lastPlayPos, "0#:##")}`}
          </span>
          <span className={style.jumpToPos} ref={jumpRef}>
            {`跳转播放`}
          </span>
        </div>
      }
    </>
  )
}

export default forwardRef(LastPosition);
