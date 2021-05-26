import { getJSON } from "./fetch";
import { URL_SPACE_GET_HISTORY } from "./url";

/* 获取历史记录 */
export function getViewedHistory(aId?: number, type?: string) {
  return getJSON(URL_SPACE_GET_HISTORY, { max: aId, business: type });
}
