import { AnyAction, Dispatch } from "redux";

import { setVideoInfo, setShouldLoad } from "../action-creators";
import { getVideoInfo, getPlayUrl } from "@api/video";

import { createVideoByDetail } from "@class-object-creators/Video";

export default function getVideoDetail(aId: number) {
  return (dispatch: Dispatch<AnyAction>) => {
    return getVideoInfo(aId).then(async result => {
      if (result.code === "1") {
        const video = createVideoByDetail(result.data);
        await getPlayUrl(aId, video.cId).then(r => { // 这里不用await的话videoPage会报错
          // console.log(r.data)
          // video.url = r.data.durl[0].url;
          // console.log(r.data.dash)
          video.url = r.data.dash.video[0].baseUrl;
          video.Aurl = r.data.dash.audio[0].baseUrl;
          dispatch(setVideoInfo(video));
        });
      }

      process.env.REACT_ENV === "server" && dispatch(setShouldLoad(false));
    });
  };
}
