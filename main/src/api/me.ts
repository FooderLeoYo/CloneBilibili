import { getJSON, postJSON } from "./fetch";
import { URL_LOGIN_EXIT_LOGIN } from "./url";

export function exitLogin() {
  return getJSON(URL_LOGIN_EXIT_LOGIN, null);
}