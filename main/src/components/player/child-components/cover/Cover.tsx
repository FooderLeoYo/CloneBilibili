import * as React from "react";

import { formatDuration } from "../../../../customed-methods/string";

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
  lastPosRef: React.MutableRefObject<any>
}

function Cover(props: CoverProps) {
  const { isLive, video, playOrPause, lastPosRef } = props;

  return (
    <>
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
                  lastPosRef.current.hideLastPos();
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
    </>
  )
}

export default Cover;