// 这个文件的作用，是将/api中的各组件数据请求方法文件所需的请求url，进行常量化
// 然后再导出给各请求方法文件

// URL_PREFIX在/config/dev.env.js和prod.env.js中
const prefix = process.env.URL_PREFIX;

const URL_INDEX = prefix + "/index";
const URL_ROUND_SOWING = prefix + "/round-sowing";

const URL_PARTITION = prefix + "/partitions";

const URL_RANKING = prefix + "/ranking";
const URL_RANKING_REGION = prefix + "/ranking/region";
const URL_RANKING_ARCHIVE = prefix + "/ranking/archive";

const URL_RANKING_PARTITION = prefix + "/ranking/partitions";

const URL_VIDEO_DETAIL = prefix + "/av";
const URL_VIDEO_RECOMMEND = prefix + "/av/recommend";
const URL_VIDEO_REPLAY = prefix + "/av/replay";
const URL_VIDEO_BARRAG = prefix + "/av/barrage";
const URL_PLAY_URL = prefix + "/av/play_url";

const URL_UP_USER = prefix + "/up";
const URL_USER_VIDEO = prefix + "/up/video";

const URL_SEARCH_HOTWORD = prefix + "/search/hotword";
const URL_SEARCH_SUGGEST = prefix + "/search/suggest";
const URL_SEARCH = prefix + "/search";

const URL_LIVE_AREA = prefix + "/live/area";
const URL_LIVE_DATA = prefix + "/live/data";
const URL_LIVE_LIST = prefix + "/live/room/list";
const URL_LIVE_ROOM_INFO = prefix + "/live/room/info";
const URL_LIVE_ROOM_GIFT = prefix + "/live/room/gifts";
const URL_LIVE_PLAY_URL = prefix + "/live/room/play_url";
const URL_LIVE_DANMU_CONFIG = prefix + "/live/room/danmu_config";

const URL_LOGIN_GT_CAPTCHA = prefix + "/login/getgtcaptcha";
const URL_LOGIN_PW_KEYHASH = prefix + "/login/getpwkeyhash";
const URL_LOGIN_PW_VERIFY = prefix + "/login/verifypassword";
const URL_LOGIN_NAV_INFO = prefix + "/login/getnavuserinfo";
const URL_LOGIN_AREA_CODE = prefix + "/login/getareacode";
const URL_LOGIN_SMS_CAPTCHA = prefix + "/login/getsmscaptcha";
const URL_LOGIN_SMS_VERIFY = prefix + "/login/verifysms";
const URL_LOGIN_EXIT_LOGIN = prefix + "/login/exitlogin";

export {
  URL_INDEX,
  URL_ROUND_SOWING,
  URL_PARTITION,
  URL_RANKING,
  URL_RANKING_REGION,
  URL_RANKING_ARCHIVE,
  URL_RANKING_PARTITION,
  URL_VIDEO_DETAIL,
  URL_VIDEO_RECOMMEND,
  URL_VIDEO_REPLAY,
  URL_VIDEO_BARRAG,
  URL_PLAY_URL,
  URL_UP_USER,
  URL_USER_VIDEO,
  URL_SEARCH_HOTWORD,
  URL_SEARCH_SUGGEST,
  URL_SEARCH,
  URL_LIVE_AREA,
  URL_LIVE_DATA,
  URL_LIVE_LIST,
  URL_LIVE_ROOM_INFO,
  URL_LIVE_ROOM_GIFT,
  URL_LIVE_PLAY_URL,
  URL_LIVE_DANMU_CONFIG,
  URL_LOGIN_GT_CAPTCHA,
  URL_LOGIN_PW_KEYHASH,
  URL_LOGIN_PW_VERIFY,
  URL_LOGIN_NAV_INFO,
  URL_LOGIN_AREA_CODE,
  URL_LOGIN_SMS_CAPTCHA,
  URL_LOGIN_SMS_VERIFY,
  URL_LOGIN_EXIT_LOGIN
}
