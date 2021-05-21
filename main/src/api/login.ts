import { getJSON, postJSON } from "./fetch";
import {
  URL_LOGIN_GT_CAPTCHA, URL_LOGIN_PW_KEYHASH, URL_LOGIN_PW_VERIFY, URL_LOGIN_NAV_INFO,
  URL_LOGIN_AREA_CODE, URL_LOGIN_SMS_CAPTCHA, URL_LOGIN_SMS_VERIFY, URL_LOGIN_EXIT_LOGIN
} from "./url";

/* 获取人机验证码 */
export function getGTCaptcha() {
  return getJSON(URL_LOGIN_GT_CAPTCHA, null);
}

/* 获取加密公钥及密码盐值 */
export function getPWKeyAndHash() {
  return getJSON(URL_LOGIN_PW_KEYHASH, null);
}

/* 验证密码登录信息并返回cookie */
export function getPWVerifyInfo(param) {
  return postJSON(URL_LOGIN_PW_VERIFY, param);
}

/* 获取导航栏用户信息信息 */
export function getNavUserInfo() {
  return getJSON(URL_LOGIN_NAV_INFO, null);
}

/* 获取所有手机区号 */
export function getAreaCode() {
  return getJSON(URL_LOGIN_AREA_CODE, null);
}

/* 获取短信验证码 */
export function getCaptcha(param) {
  return postJSON(URL_LOGIN_SMS_CAPTCHA, param);
}

/* 验证短信登录信息并返回cookie */
export function getSMSVerifyInfo(param) {
  return postJSON(URL_LOGIN_SMS_VERIFY, param);
}

export function exitLogin() {
  return getJSON(URL_LOGIN_EXIT_LOGIN, null);
}
