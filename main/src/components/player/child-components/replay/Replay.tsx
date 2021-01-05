import * as React from "react";
import style from "./replay.styl?css-modules";

interface ReplayProps {
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

function Replay(props: ReplayProps) {
  const { video, playOrPause } = props;

  return (
    <div className={style.finishCover}>
      <img className={style.coverPic} src={video.cover} alt={video.title} />
      <div className={style.coverWrapper}>
        <div
          className={style.replay}
          onClick={e => {
            e.stopPropagation();
            playOrPause();
          }}
        >
          <span className={style.replayIcon}>
            <svg className="icon" aria-hidden="true">
              <use href="#icon-replay"></use>
            </svg>
          </span>
          <span className={style.replayWords}>重新播放</span>
        </div>
      </div>
    </div>
  );
}

export default Replay;