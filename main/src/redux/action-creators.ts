import { AnyAction } from "redux";

import * as ActionTypes from "./action-types";
import { Video, UpUser } from "../class-object-creators";

// shouldLoad在reducers.ts中给的默认值是true
// 服务端渲染时，会dispatch(setShouldLoad(false))

// 即如果组件是通过路由跳转进入的，页面将没数据(ssr只提供首屏数据)
// shouldLoad为true，componentDidMount中会dispatch相关数据供组件使用

// 如果发生了页面刷新(常规跳转或按刷新键)，则服务端会预取数据，此时页面使用
// 的数据就是ssr提供的首屏数据，shouldLoad变为false
export function setShouldLoad(shouldLoad: boolean): AnyAction {
  return { type: ActionTypes.SET_SHOULD_LOAD, shouldLoad };
}

export function setOneLevelPartitions(oneLevelPartitions: Array<any>): AnyAction {
  return { type: ActionTypes.SET_ONE_LEVEL_PARTITIONS, oneLevelPartitions };
}

export function setBanners(banners: Array<any>): AnyAction {
  return { type: ActionTypes.SET_BANNERS, banners };
}

export function setAdditionalVideos(additionalVideos: Array<any>): AnyAction {
  return { type: ActionTypes.SET_ADDITIONAL_VIDEOS, additionalVideos };
}

export function setRankingVideos(rankingVideos: Array<any>): AnyAction {
  return { type: ActionTypes.SET_RANKING_VIDEOS, rankingVideos };
}

export function setPartitions(partitions: Array<any>): AnyAction {
  return { type: ActionTypes.SET_PARTITIONS, partitions };
}

export function setRankingPartitions(rankingPartitions: Array<any>): AnyAction {
  return { type: ActionTypes.SET_RANKING_PARTITIONS, rankingPartitions };
}

export function setVideoInfo(video: Video): AnyAction {
  return { type: ActionTypes.SET_VIDEO_INFO, video };
}

export function setUpUserInfo(upUser: any): AnyAction {
  return { type: ActionTypes.SET_UP_USER, upUser };
}


export function setLiveData(liveData: any): AnyAction {
  return { type: ActionTypes.SET_LIVE_DATA, liveData };
}

export function setLiveList(liveListData: any): AnyAction {
  return { type: ActionTypes.SET_LIVE_LIST, liveListData };
}

export function setRoomData(roomData: any): AnyAction {
  return { type: ActionTypes.SET_ROOM_DATA, roomData };
}