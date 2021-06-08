import { getJSON, postJSON } from "./fetch";
import { URL_SPACE_GET_RELATION } from "./url";



/* 获取关系数据 */
export function fetchRelation(uid: number) {
  return getJSON(URL_SPACE_GET_RELATION + `/${uid}`, null);
}
