import { getJSON, postJSON } from "./fetch";
import {
  URL_ME_MY_RELATION, URL_ME_GET_HISTORY, URL_ME_DELETE_HISTORY,
  URL_ME_EXIT_LOGIN, URL_ME_EDIT_FAV, URL_ME_CREATE_FAV, URL_ME_GET_LATER,
  URL_ME_DEL_INVALID_FAV_CONTENT
} from "./url";

/* 获取我的状态数 */
export function fetchMyRelation() {
  return getJSON(URL_ME_MY_RELATION, null);
}

/* 获取历史记录 */
export function getHistory(aId: number = 0, type: string = "", count: number = 20) {
  return getJSON(URL_ME_GET_HISTORY, { max: aId, business: type, ps: count });
}

/* 删除历史记录 */
export function deleteHistory(kid: string) {
  return postJSON(URL_ME_DELETE_HISTORY, { kid: kid });
}

/* 编辑收藏夹 */
export function editFav(media_id: number, title: string, intro: string = "", privacy: number = 0) {
  return postJSON(URL_ME_EDIT_FAV, { media_id, title, intro, privacy });
}

/* 新增收藏夹 */
export function createFav(title: string, intro: string = "", privacy: number = 0) {
  return postJSON(URL_ME_CREATE_FAV, { title, intro, privacy });
}

/* 一键清空失效内容 */
export function delInvalidFavContent(media_id: number) {
  return postJSON(URL_ME_DEL_INVALID_FAV_CONTENT, { media_id });
}

export function getLater() {
  return getJSON(URL_ME_GET_LATER, null);
}

/* 退出登录 */
export function exitLogin() {
  return getJSON(URL_ME_EXIT_LOGIN, null);
}