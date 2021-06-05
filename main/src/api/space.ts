import { getJSON, postJSON } from "./fetch";
import { URL_SPACE_GET_HISTORY, URL_SPACE_GET_RELATION } from "./url";

/* 获取历史记录 */
export function getViewedHistory(aId: number = 0, type: string = "", count: number = 20) {
  return getJSON(URL_SPACE_GET_HISTORY, { max: aId, business: type, ps: count });
}

/* 获取关系数据 */
export function fetchRelation(uid: number) {
  return getJSON(URL_SPACE_GET_RELATION + `/${uid}`, null);
}
