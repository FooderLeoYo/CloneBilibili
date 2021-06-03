import { getJSON, postJSON } from "./fetch";
import { URL_SPACE_GET_HISTORY, URL_SPACE_CLEAR_HISTORY } from "./url";

/* 获取历史记录 */
export function getViewedHistory(aId: number = 0, type: string = "", count: number = 20) {
  return getJSON(URL_SPACE_GET_HISTORY, { max: aId, business: type, ps: count });
}

export function clearHistory() {
  return postJSON(URL_SPACE_CLEAR_HISTORY, {});
}


