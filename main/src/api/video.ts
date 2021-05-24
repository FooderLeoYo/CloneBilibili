import { getJSON, postJSON } from "./fetch";
import {
  URL_VIDEO_DETAIL,
  URL_PLAY_URL,
  URL_VIDEO_RECOMMEND,
  URL_VIDEO_REPLAY,
  URL_VIDEO_BARRAG,
  URL_VIDEO_REPORT
} from "./url";

/**
 * 获取视频信息
 */
export function getVideoInfo(aId: number) {
  return getJSON(URL_VIDEO_DETAIL + `/${aId}`, null);
}

/**
 * 获取视频播放地址
 */
export function getPlayUrl(aId: number, cId: number) {
  return getJSON(URL_PLAY_URL + `?aId=${aId}&cId=${cId}`, null);
}

/**
 * 获取推荐视频列表
 */
export function getRecommendVides(aId: number) {
  return getJSON(URL_VIDEO_RECOMMEND + `/${aId}`, null);
}

/**
 * 获取评论列表
 */
export function getComments(aId: number, p: number) {
  return getJSON(URL_VIDEO_REPLAY, { aId, p });
}

/**
 * 获取弹幕
 */
export function getBarrages(cId: number) {
  return getJSON(URL_VIDEO_BARRAG + `/${cId}`, null)
}

/* 
上报观看记录
 */
export function postReport(param) {
  console.log(param)
  return postJSON(URL_VIDEO_REPORT, param);
}
