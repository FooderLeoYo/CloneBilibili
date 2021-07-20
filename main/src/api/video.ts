import { getJSON, postJSON } from "./fetch";
import {
  URL_VIDEO_DETAIL, URL_VIDEO_PLAY_URL, URL_VIDEO_RECOMMEND,
  URL_VIDEO_REPLAY, URL_VIDEO_GET_BARR, URL_VIDEO_REPORT,
  URL_VIDEO_SEND_BARR, URL_VIDEO_THUMBUP_BARR, URL_VIDEO_GET_BARR_LIKE_COUNT
} from "./url";

/**
 * 获取视频信息
 */
export function getVideoInfo(aId: number) {
  return getJSON(URL_VIDEO_DETAIL, { aId });
}

/**
 * 获取视频播放地址
 */
export function getPlayUrl(aId: number, cId: number) {
  return getJSON(URL_VIDEO_PLAY_URL, { aId, cId });
}

/**
 * 获取推荐视频列表
 */
export function getRecommendVides(aId: number) {
  return getJSON(URL_VIDEO_RECOMMEND, { aId });
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
  return getJSON(URL_VIDEO_GET_BARR, { cId });
}

/* 
上报观看记录
 */
export function postViewedReport(param) {
  return postJSON(URL_VIDEO_REPORT, param);
}

/* 发送弹幕 */
export function sendBarrage(aid: number, mode: number, msg: string, oid: number,
  rnd: number, type: number, color: number = 16777215, fontsize: number = 25) {
  return postJSON(URL_VIDEO_SEND_BARR, { aid, mode, msg, oid, rnd, type, color, fontsize });
}

/* 点赞弹幕 */
export function thumbupBarr(dmid: string, oid: number, op: number) {
  return postJSON(URL_VIDEO_THUMBUP_BARR, { dmid, oid, op });
}

/* 查询弹幕点赞数 */
export function getBarrLikeCount(oid: number, ids: string) {
  return getJSON(URL_VIDEO_GET_BARR_LIKE_COUNT, { oid, ids });
}