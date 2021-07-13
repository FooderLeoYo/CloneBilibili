// 这个文件的作用，是将/api中的各组件数据请求方法文件所需的请求url，进行常量化
// 然后再导出给各请求方法文件

// URL_PREFIX在/config/dev.env.js和prod.env.js中
const prefix = process.env.URL_PREFIX;


/* 首页相关 */
const URL_INDEX = prefix + "/index";
const URL_PARTITION = prefix + "/partitions";
const URL_ROUND_SOWING = prefix + "/round-sowing";

/* 直播相关 */
const URL_LIVE_AREA = prefix + "/live/area";
const URL_LIVE_DANMU_CONFIG = prefix + "/live/room/danmu_config";
const URL_LIVE_DATA = prefix + "/live/data";
const URL_LIVE_LIST = prefix + "/live/room/list";
const URL_LIVE_PLAY_URL = prefix + "/live/room/play_url";
const URL_LIVE_ROOM_GIFT = prefix + "/live/room/gifts";
const URL_LIVE_ROOM_INFO = prefix + "/live/room/info";

/* 登录相关 */
const URL_LOGIN_AREA_CODE = prefix + "/login/getareacode";
const URL_LOGIN_GT_CAPTCHA = prefix + "/login/getgtcaptcha";
const URL_LOGIN_NAV_INFO = prefix + "/login/getnavuserinfo";
const URL_LOGIN_PW_KEYHASH = prefix + "/login/getpwkeyhash";
const URL_LOGIN_PW_VERIFY = prefix + "/login/verifypassword";
const URL_LOGIN_SMS_VERIFY = prefix + "/login/verifysms";
const URL_LOGIN_SMS_CAPTCHA = prefix + "/login/getsmscaptcha";

/* 个人中心相关 */
const URL_ME_CREATE_FAV = prefix + "/me/createfav";
const URL_ME_DEL_INVALID_FAV_CONTENT = prefix + "/me/delinvalidfavcontent";
const URL_ME_DELETE_HISTORY = prefix + "/me/deletehistory";
const URL_ME_EXIT_LOGIN = prefix + "/me/exitlogin";
const URL_ME_EDIT_FAV = prefix + "/me/editfav";
const URL_ME_GET_HISTORY = prefix + "/me/gethistory";
const URL_ME_GET_LATER = prefix + "/me/getlater";
const URL_ME_MY_RELATION = prefix + "/me/getmyrelation";

/* 排行榜相关 */
const URL_RANKING = prefix + "/ranking/list";
const URL_RANKING_ARCHIVE = prefix + "/ranking/archive";
const URL_RANKING_PARTITION = prefix + "/ranking/partitions";
const URL_RANKING_REGION = prefix + "/ranking/region";

/* 搜索相关 */
const URL_SEARCH = prefix + "/search";
const URL_SEARCH_HOTWORD = prefix + "/search/hotword";
const URL_SEARCH_SUGGEST = prefix + "/search/suggest";

/* 空间相关 */
const URL_SPACE_FAV_DETAIL = prefix + "/space/getfavdetail";
const URL_SPACE_FAV_INFO = prefix + "/space/getfavinfo";
const URL_SPACE_FAV_LIST_COLLECTED = prefix + "/space/getfavlistcollected";
const URL_SPACE_FAV_LIST_CREATED = prefix + "/space/getfavlistcreated";
const URL_SPACE_RELATION = prefix + "/space/getrelation";
const URL_SPACE_SERIES_FOLLOWED = prefix + "/space/getseriesfollowed";
const URL_SPACE_USER = prefix + "/space/userinfo";
const URL_SPACE_VIDEO = prefix + "/space/video";

/* 视频相关 */
const URL_VIDEO_DETAIL = prefix + "/av/info";
const URL_VIDEO_GET_BARR = prefix + "/av/getbarr";
const URL_VIDEO_PLAY_URL = prefix + "/av/play_url";
const URL_VIDEO_RECOMMEND = prefix + "/av/recommend";
const URL_VIDEO_REPLAY = prefix + "/av/replay";
const URL_VIDEO_REPORT = prefix + "/av/report";
const URL_VIDEO_SEND_BARR = prefix + "/av/sendbarr";


export {
  /* 首页相关 */
  URL_INDEX, URL_PARTITION, URL_ROUND_SOWING,
  /* 直播相关 */
  URL_LIVE_AREA, URL_LIVE_DANMU_CONFIG, URL_LIVE_DATA, URL_LIVE_LIST,
  URL_LIVE_PLAY_URL, URL_LIVE_ROOM_GIFT, URL_LIVE_ROOM_INFO,
  /* 登录相关 */
  URL_LOGIN_AREA_CODE, URL_LOGIN_GT_CAPTCHA, URL_LOGIN_NAV_INFO, URL_LOGIN_PW_KEYHASH,
  URL_LOGIN_PW_VERIFY, URL_LOGIN_SMS_VERIFY, URL_LOGIN_SMS_CAPTCHA,
  /* 个人中心相关 */
  URL_ME_CREATE_FAV, URL_ME_DEL_INVALID_FAV_CONTENT, URL_ME_DELETE_HISTORY, URL_ME_EXIT_LOGIN,
  URL_ME_EDIT_FAV, URL_ME_GET_HISTORY, URL_ME_GET_LATER, URL_ME_MY_RELATION,
  /* 排行榜相关 */
  URL_RANKING, URL_RANKING_ARCHIVE, URL_RANKING_PARTITION, URL_RANKING_REGION,
  /* 搜索相关 */
  URL_SEARCH, URL_SEARCH_HOTWORD, URL_SEARCH_SUGGEST,
  /* 空间相关 */
  URL_SPACE_FAV_DETAIL, URL_SPACE_FAV_INFO, URL_SPACE_FAV_LIST_COLLECTED,
  URL_SPACE_FAV_LIST_CREATED, URL_SPACE_RELATION, URL_SPACE_SERIES_FOLLOWED,
  URL_SPACE_USER, URL_SPACE_VIDEO,
  /* 视频相关 */
  URL_VIDEO_DETAIL, URL_VIDEO_GET_BARR, URL_VIDEO_PLAY_URL, URL_VIDEO_RECOMMEND,
  URL_VIDEO_REPLAY, URL_VIDEO_REPORT, URL_VIDEO_SEND_BARR
}
