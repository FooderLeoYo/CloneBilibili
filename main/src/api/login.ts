import { getJSON, postJSON } from "./fetch";
import {
  URL_LOGIN_GT_CAPTCHA,
  URL_LOGIN_PW_KEYHASH,
  URL_LOGIN_PW_VERIFY,
  URL_LOGIN_NAV_INFO,
  URL_LOGIN_AREA_CODE,
} from "./url";

/* 获取人机验证码 */
export function getGTCaptcha() {
  return getJSON(URL_LOGIN_GT_CAPTCHA, null);
}

/* 获取加密公钥及密码盐值 */
export function getPWKeyAndHash() {
  return getJSON(URL_LOGIN_PW_KEYHASH, null);
}

/* 验证登录信息并返回cookie */
export function getLoginVerifyInfo(param) {
  return postJSON(URL_LOGIN_PW_VERIFY, param);
}

/* 获取导航栏用户信息信息 */
export function getNavUserInfo() {
  return getJSON(URL_LOGIN_NAV_INFO, null);
}

export function getAreaCode() {
  return getJSON(URL_LOGIN_AREA_CODE, null);
}