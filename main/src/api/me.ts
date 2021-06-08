import { getJSON, postJSON } from "./fetch";
import { URL_ME_GET_HISTORY, URL_ME_DELETE_HISTORY, URL_ME_EXIT_LOGIN } from "./url";

/* 获取历史记录 */
export function getHistory(aId: number = 0, type: string = "", count: number = 20) {
  return getJSON(URL_ME_GET_HISTORY, { max: aId, business: type, ps: count });
}

/* 删除历史记录 */

export function deleteHistory(kid: string) {
  return postJSON(URL_ME_DELETE_HISTORY, { kid: kid });
}

/* 退出登录 */
export function exitLogin() {
  return getJSON(URL_ME_EXIT_LOGIN, null);
}