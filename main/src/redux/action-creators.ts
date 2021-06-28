import { AnyAction } from "redux";
import * as ActionTypes from "./action-types";
import { Video } from "../class-object-creators";

// shouldLoad在reducers.ts中给的默认值是true
// 服务端渲染时，会dispatch(setShouldLoad(false))

// 即如果组件是通过路由跳转进入的，页面将没数据(ssr只提供首屏数据)
// shouldLoad为true，componentDidMount中会dispatch相关数据供组件使用

// 如果发生了页面刷新(常规跳转或按刷新键)，则服务端会预取数据，此时页面使用
// 的数据就是ssr提供的首屏数据，shouldLoad变为false


/* 全局 */

export function setShouldLoad(shouldLoad: boolean): AnyAction {
  return { type: ActionTypes.SET_SHOULD_LOAD, shouldLoad };
}

export function setLvOneTabs(lvOneTabs: Array<any>): AnyAction {
  return { type: ActionTypes.SET_LV_ONE_TABS, lvOneTabs };
}


/* 首页相关 */

export function setBanners(indexBanners: Array<any>): AnyAction {
  return { type: ActionTypes.SET_INDEX_BANNERS, indexBanners };
}

export function setAdditionalVideos(additionalVideos: Array<any>): AnyAction {
  return { type: ActionTypes.SET_ADDITIONAL_VIDEOS, additionalVideos };
}


/* 排行榜相关 */

export function setRankingVideos(rankingVideos: Array<any>): AnyAction {
  return { type: ActionTypes.SET_RANKING_VIDEOS, rankingVideos };
}

export function setRankingPartitions(rankingPartitions: Array<any>): AnyAction {
  return { type: ActionTypes.SET_RANKING_PARTITIONS, rankingPartitions };
}


/* 视频相关 */

export function setVideoInfo(video: Video): AnyAction {
  return { type: ActionTypes.SET_VIDEO_INFO, video };
}


/* 空间相关 */

export function setUpUserInfo(upUser: any): AnyAction {
  return { type: ActionTypes.SET_UP_USER, upUser };
}


/* 直播相关 */

export function setliveBanners(liveBanners: any): AnyAction {
  return { type: ActionTypes.SET_LIVE_BANNERS, liveBanners };
}

export function setLiveLvTwoTabs(liveLvTwoTabs: any): AnyAction {
  return { type: ActionTypes.SET_LIVE_LV_TWO_TABS, liveLvTwoTabs };
}

export function setLiveLvTwoQuery(liveLvTwoQueries: any): AnyAction {
  return { type: ActionTypes.SET_LIVE_LV_TWO_QUERIES, liveLvTwoQueries };
}

export function setLivePartitionRecList(partitionRecList: any): AnyAction {
  return { type: ActionTypes.SET_LIVE_PARTITION_REC_LIST, partitionRecList };
}

export function setLiveList(liveListData: any): AnyAction {
  return { type: ActionTypes.SET_LIVE_LIST, liveListData };
}

export function setRoomData(roomData: any): AnyAction {
  return { type: ActionTypes.SET_ROOM_DATA, roomData };
}
