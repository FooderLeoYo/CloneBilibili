import { getJSON, postJSON } from "./fetch";
import {
  URL_SPACE_RELATION, URL_SPACE_USER, URL_SPACE_VIDEO,
  URL_SPACE_FAV_LIST_CREATED
} from "./url";

/**
 * 获取up主信息
 */
export function getUserInfo(mId: number) {
  return getJSON(URL_SPACE_USER + `/${mId}`, null);
}

/**
 * 获取up主投稿视频
 */
export function getUserVideos(aId: number, p: number, size: number) {
  return getJSON(URL_SPACE_VIDEO, { uId: aId, p, size });
}

/* 获取关系数据 */
export function fetchRelation(uid: number) {
  return getJSON(URL_SPACE_RELATION + `/${uid}`, null);
}

/* 获取收藏夹列表 */
export function fetchFavListCreated(uid: number) {
  return getJSON(URL_SPACE_FAV_LIST_CREATED + `/${uid}`, null);
}
