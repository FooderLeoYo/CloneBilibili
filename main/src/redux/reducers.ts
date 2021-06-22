import { AnyAction, combineReducers } from "redux";
import * as ActionTypes from "./action-types";

const initialState = {
  shouldLoad: true,  // 客户端是否加载数据
  lvOneTabs: [], // 一级分类
  indexBanners: [],  // 轮播图
  additionalVideos: [],  // 首页额外的video
  rankingPartitions: [], // 排行榜分类列表
  rankingVideos: [], // 排行榜视频
  video: {}, // 视频信息
  upUser: {}, // up主信息,
  liveBanners: [], // 直播首页轮播图
  liveLvTwoTabs: [], // 直播二级tabs
  liveLvTwoQueries: [], // 直播二级query参数
  partitionRecList: [], // 直播首页各分区的4个推荐直播间
  liveListData: {  // 直播房间列表
    total: 0,
    list: []
  },
  roomData: {},  // 直播间数据
}

function combineShouldLoad(shouldLoad = initialState.shouldLoad, action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_SHOULD_LOAD:
      return action.shouldLoad;
    default:
      return shouldLoad;
  }
}

function combineLvOneTabs(lvOneTabs = initialState.lvOneTabs,
  action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_LV_ONE_TABS:
      return action.lvOneTabs;
    default:
      return lvOneTabs;
  }
}

function combineBanners(indexBanners = initialState.indexBanners, action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_INDEX_BANNERS:
      return action.indexBanners;
    default:
      return indexBanners;
  }
}

function combineAdditionalVideos(additionalVideos = initialState.additionalVideos,
  action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_ADDITIONAL_VIDEOS:
      return action.additionalVideos;
    default:
      return additionalVideos;
  }
}

function combineRankingPartitions(rankingPartitions = initialState.rankingPartitions,
  action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_RANKING_PARTITIONS:
      return action.rankingPartitions;
    default:
      return rankingPartitions;
  }
}

function combineRankingVideos(rankingVideos = initialState.rankingVideos, action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_RANKING_VIDEOS:
      return action.rankingVideos;
    default:
      return rankingVideos;
  }
}

function combineVideo(video = initialState.video, action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_VIDEO_INFO:
      return action.video;
    default:
      return video;
  }
}

function combineUpUser(upUser = initialState.upUser, action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_UP_USER:
      return action.upUser;
    default:
      return upUser;
  }
}

function combineliveBanners(liveBanners = initialState.liveBanners, action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_LIVE_BANNERS:
      return action.liveBanners;
    default:
      return liveBanners;
  }
}

function combineLiveLvTwoTabs(liveLvTwoTabs = initialState.liveLvTwoTabs, action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_LIVE_LV_TWO_TABS:
      return action.liveLvTwoTabs;
    default:
      return liveLvTwoTabs;
  }
}

function combineLiveLvTwoQueries(liveLvTwoQueries = initialState.liveLvTwoQueries, action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_LIVE_LV_TWO_QUERIES:
      return action.liveLvTwoQueries;
    default:
      return liveLvTwoQueries;
  }
}

function combineLivePartitionRecList(partitionRecList = initialState.partitionRecList, action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_LIVE_PARTITION_REC_LIST:
      return action.partitionRecList;
    default:
      return partitionRecList;
  }
}

function combineLiveListData(liveListData = initialState.liveListData, action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_LIVE_LIST:
      return action.liveListData;
    default:
      return liveListData;
  }
}

function combineRoomData(roomData = initialState.roomData, action: AnyAction) {
  switch (action.type) {
    case ActionTypes.SET_ROOM_DATA:
      return action.roomData;
    default:
      return roomData;
  }
}

const reducer = combineReducers({
  shouldLoad: combineShouldLoad,
  lvOneTabs: combineLvOneTabs,
  banners: combineBanners,
  additionalVideos: combineAdditionalVideos,
  rankingPartitions: combineRankingPartitions,
  rankingVideos: combineRankingVideos,
  video: combineVideo,
  upUser: combineUpUser,
  liveBanners: combineliveBanners,
  liveLvTwoTabs: combineLiveLvTwoTabs,
  liveLvTwoQueries: combineLiveLvTwoQueries,
  partitionRecList: combineLivePartitionRecList,
  liveListData: combineLiveListData,
  roomData: combineRoomData,
});

export default reducer;
