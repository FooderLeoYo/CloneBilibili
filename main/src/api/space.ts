import { getJSON } from "./fetch";
import {
  URL_SPACE_RELATION, URL_SPACE_USER, URL_SPACE_VIDEO,
  URL_SPACE_FAV_LIST_CREATED, URL_SPACE_FAV_LIST_COLLECTED,
  URL_SPACE_SERIES_FOLLOWED, URL_SPACE_FAV_INFO, URL_SPACE_FAV_DETAIL
} from "./url";

/**
 * 获取up主信息
 */
export function getUserInfo(mId: number) {
  return getJSON(URL_SPACE_USER, { mId });
}

/**
 * 获取up主投稿视频
 */
export function getUserVideos(aId: number, p: number, size: number) {
  return getJSON(URL_SPACE_VIDEO, { uId: aId, p, size });
}

/* 获取关系数据 */
export function getRelation(uid: number) {
  return getJSON(URL_SPACE_RELATION, { uid });
}

/* 获取创建的收藏夹列表 */
export function getFavListCreated(uid: number) {
  return getJSON(URL_SPACE_FAV_LIST_CREATED, { uid });
}

/* 获取收藏的收藏夹列表 */
export function getFavListCollected(ps: number, pn: number, up_mid: number) {
  return getJSON(URL_SPACE_FAV_LIST_COLLECTED, { ps, pn, up_mid });
}

/* 获取追番/剧列表 */
export function getSeriesFollowed(vmid: number, type: number, pn: number = 1, ps: number = 15) {
  return getJSON(URL_SPACE_SERIES_FOLLOWED, { vmid, type, pn, ps });
}

/* 获取目标收藏夹信息 */
export function getFavInfo(media_id: number) {
  return getJSON(URL_SPACE_FAV_INFO, { media_id });
}

/* 获取目标收藏夹内容 */
export function getFavDetail(media_id: number, ps: number) {
  return getJSON(URL_SPACE_FAV_DETAIL, { media_id, ps });
}