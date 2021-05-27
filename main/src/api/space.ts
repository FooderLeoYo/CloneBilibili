import { getJSON } from "./fetch";
import { URL_SPACE_GET_HISTORY } from "./url";

/* 获取历史记录 */
export function getViewedHistory(aId: number = 0, type: string = "", count: number = 20) {
  return getJSON(URL_SPACE_GET_HISTORY, { max: aId, business: type, ps: count });
}
// export function getViewedHistory(count?: number) {
//   return getJSON(URL_SPACE_GET_HISTORY, { ps: count });
// }
