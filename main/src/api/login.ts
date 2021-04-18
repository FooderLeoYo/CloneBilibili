import { getJSON, postJSON } from "./fetch";
import {
  URL_LOGIN_GT_CAPTCHA,
  URL_LOGIN_PW_KEYHASH,
  URL_LOGIN_PW_VERIFY
} from "./url";

/* 获取人机验证码 */
export function getGTCaptcha() {
  return getJSON(URL_LOGIN_GT_CAPTCHA, null);
}

/* 获取加密公钥及密码盐值 */
export function getPWKeyAndHash() {
  return getJSON(URL_LOGIN_PW_KEYHASH, null);
}

export function getSearchResult(param) {
  return postJSON(URL_LOGIN_PW_VERIFY, param);
}

