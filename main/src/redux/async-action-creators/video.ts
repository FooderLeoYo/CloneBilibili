import { AnyAction, Dispatch } from "redux";

import { setVideoInfo, setShouldLoad } from "../action-creators";
import { getVideoInfo, getPlayUrl } from "../../api/video";

import { createVideoByDetail } from "../../class-object-creators/Video";

export default function getVideoDetail(aId: number) {
  return (dispatch: Dispatch<AnyAction>) => {
    return getVideoInfo(aId)
      .then(async result => {
        if (result.code === "1") {
          const video = createVideoByDetail(result.data);
          await getPlayUrl(aId, video.cId)
            .then(r => {
              video.url = r.data.durl[0].url;
            });
          dispatch(setVideoInfo(video));
        }

        if (process.env.REACT_ENV === "server") {
          dispatch(setShouldLoad(false));
        }
      });
  };
}
