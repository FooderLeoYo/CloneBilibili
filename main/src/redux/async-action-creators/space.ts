import { AnyAction, Dispatch } from "redux";
import { setShouldLoad, setUpUserInfo, setVideoInfo } from "../action-creators";
import { getUserInfo, getUserVideos } from "../../api/space";
import { UpUser, createVideoByUser } from "../../class-object-creators";

export default function getUser(mId: number) {
  return (dispatch: Dispatch<AnyAction>) => {
    const promises = [
      getUserInfo(mId),
      getUserVideos(mId, 1, 10)
    ]
    return Promise.all(promises).then(([userRes, videoRes]) => {
      if (userRes.code === "1") {
        const data = userRes.data;
        const upUser = new UpUser(
          data.mid,
          data.name,
          data.face,
          data.level,
          data.sex,
          data.sign,
          data.status.following,
          data.status.follower
        );

        dispatch(setUpUserInfo(upUser));
      }

      if (videoRes.code === "1") {
        const vList = videoRes.data.list.vlist;
        const videos = vList.map(data => createVideoByUser(data));
        dispatch(setVideoInfo(videos));
      }

      if (process.env.REACT_ENV === "server") {
        dispatch(setShouldLoad(false));
      }
    });
  }
}
