const fetch = require("node-fetch");
const querystring = require("querystring");


/* 综合相关 */

// 首页轮播
const URL_ROUND_SOWING = "https://api.bilibili.com/x/web-show/res/loc?pf=7&id=1695";


/* 直播相关 */

// 分类
const URL_LIVE_AREA = "https://api.live.bilibili.com/room/v1/AppIndex/getAreas?device=phone&platform=ios&scale=3&build=1000";
// 弹幕配置
const URL_LIVE_DANMMU_CONFIG = "https://api.live.bilibili.com/room/v1/Danmu/getConf?room_id={roomid}&platform=h5";
// 礼物
const URL_LIVE_GIFT = "https://api.live.bilibili.com/appIndex/getAllItem?scale=1";
// 直播首页
const URL_LIVE_INDEX = "https://api.live.bilibili.com/room/v2/AppIndex/getAllList?device=phone&platform=ios&scale=3";
// 房间列表
const URL_LIVE_ROOM_LIST = "https://api.live.bilibili.com/room/v2/Area/getRoomList";
// 房间信息
const URL_LIVE_ROOM_INFO = "https://api.live.bilibili.com/room/v1/Room/get_info?device=phone&platform=ios&scale=3&build=10000&room_id={roomid}";
// 直播地址
const URL_LIVE_URL = "https://api.live.bilibili.com/room/v1/Room/playUrl?cid={roomid}&platform=h5&otype=json&quality=0";


/* 登录相关 */

// 获取手机区号
const URL_LOGIN_AREA_CODE = "https://passport.bilibili.com/web/generic/country/list";
// 申请人机验证码参数
const URL_LOGIN_GT_CAPTCHA = "https://passport.bilibili.com/web/captcha/combine?plat=6";
// 获取导航栏用户信息信息
const URL_LOGIN_NAV_INFO = "https://api.bilibili.com/nav";
// 获取加密公钥及密码盐值
const URL_LOGIN_PW_KEYHASH = "https://passport.bilibili.com/login?act=getkey";
// 验证密码登录信息并返回cookie
const URL_LOGIN_PW_VERIFY = "https://passport.bilibili.com/web/login/v2";
// 获取短信验证码
const URL_LOGIN_SMS_CAPTCHA = "https://passport.bilibili.com/web/sms/general/v2/send";
// 验证短信登录信息并返回cookie
const URL_LOGIN_SMS_VERIFY = "https://passport.bilibili.com/web/login/rapid";


/* 个人中心相关 */

// 新增收藏夹
const URL_ME_CREATE_FAV = "http://api.bilibili.com/x/v3/fav/folder/add";
// 一键清空无效内容
const URL_ME_DEL_INVALID_FAV_CONTENT = "http://api.bilibili.com/x/v3/fav/resource/clean";
// 删除历史记录
const URL_ME_DELETE_HISTORY = "http://api.bilibili.com/x/v2/history/delete";
// 编辑收藏夹
const URL_ME_EDIT_FAV = "http://api.bilibili.com/x/v3/fav/folder/edit";
// 退出登录
const URL_ME_EXIT_LOGIN = "https://passport.bilibili.com/login?act=exit";
// 获取历史记录
const URL_ME_GET_HISTORY = "https://api.bilibili.com/x/web-interface/history/cursor";
// 获取关系状态数
const URL_ME_MYRELATION = "http://api.bilibili.com/x/web-interface/nav/stat";


/* 排行榜相关 */

// 排行榜
const URL_RANKING = "https://api.bilibili.com/x/web-interface/ranking?rid={rid}&day=3";
// 当前分类排行
const URL_RANKING_ARCHIVE = "https://api.bilibili.com/archive_rank/getarchiverankbypartion?tid={tid}&pn={p}";
// 分类排行榜
const URL_RANKING_REGION = "https://api.bilibili.com/x/web-interface/ranking/region?rid={rid}&day={day}";


/* 搜索相关 */

// 热搜
const URL_SEARCH_HOT_WORD = "https://s.search.bilibili.com/main/hotword";
// 搜索推荐
const URL_SEARCH_SUGGEST = "https://s.search.bilibili.com/main/suggest";
// 搜索
const URL_SEARCH_SEARCH = "https://api.bilibili.com/x/web-interface/search/type";


/* 空间相关 */

// 收藏夹内容
const URL_SPACE_FAV_DETAIL = "http://api.bilibili.com/x/v3/fav/resource/list";
// 收藏夹信息
const URL_SPACE_FAV_INFO = "http://api.bilibili.com/x/v3/fav/folder/info";
// 收藏的收藏夹列表
const URL_SPACE_FAV_LIST_COLLECTED = "http://api.bilibili.com/x/v3/fav/folder/collected/list";
// 创建的收藏夹列表
const URL_SPACE_FAV_LIST_CREATED = "http://api.bilibili.com/x/v3/fav/folder/created/list-all";
// 追番/剧列表
const URL_SPACE_SERIES_FOLLOWED = "http://api.bilibili.com/x/space/bangumi/follow/list";
// 用户信息
const URL_SPACE_USER_INFO = "https://api.bilibili.com/x/space/acc/info?mid={mid}";
// 用户状态
const URL_SPACE_USER_STATUS = "https://api.bilibili.com/x/relation/stat?vmid={mid}";
// 用户投稿视频列表
const URL_SPACE_VIDEO = "https://api.bilibili.com/x/space/arc/search?pn={p}&ps={size}&order=click&keyword=&mid={mid}"


/* 视频相关 */

// 详情弹幕
const URL_VIDEO_BARRAGE = "https://api.bilibili.com/x/v1/dm/list.so?oid={cid}";
// 视频详情
const URL_VIDEO_DETAIL = "https://api.bilibili.com/x/web-interface/view?aid={aid}&bvid=";
// 视频播放地址
const URL_VIDEO_PLAY_URL = "https://api.bilibili.com/x/player/playurl?cid={cid}&avid={aid}&platform=html5&otype=json&qn=16&type=mp4&html5=1";
// 详情推荐
const URL_VIDEO_RECOMMEND = "https://api.bilibili.com/x/web-interface/archive/related?aid={aid}&context=";
// 详情回复
const URL_VIDEO_REPLAY = "https://api.bilibili.com/x/v2/reply?type=1&sort=2&oid={oid}&pn={p}&nohot=1";
// 上报观看记录
const URL_VIDEO_VIEWED_REPORT = "https://api.bilibili.com/x/v2/history/report";


const userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) " +
  "AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1";


/* 综合相关 */

const fetchRoundSowing = () => {
  return fetch(URL_ROUND_SOWING)
    .then(res => res.json())
    .then(json => json);
}


/* 直播相关 */

const fetchLiveArea = () => {
  return fetch(URL_LIVE_AREA)
    .then(res => res.json())
    .then(json => json);
}

const fetchDanMuConfig = roomId => {
  return fetch(URL_LIVE_DANMMU_CONFIG.replace("{roomid}", roomId))
    .then(res => res.json())
    .then(json => json);
}

const fetchLiveGift = () => {
  return fetch(URL_LIVE_GIFT)
    .then(res => res.json())
    .then(json => json);
}

const fetchLiveList = () => {
  return fetch(URL_LIVE_INDEX)
    .then(res => res.json())
    .then(json => json);
}

const fetchRoomList = data => {
  const params = [
    `parent_area_id=${data.parentAreaId}`,
    `area_id=${data.areaId}`,
    `page=${data.page}`,
    `page_size=${data.pageSize}`,
    "sort_type=online",
    "device=phone",
    "platform=ios",
    "scale=3",
    "build=10000"
  ];
  return fetch(URL_LIVE_ROOM_LIST + "?" + params.join("&"))
    .then(res => res.json())
    .then(json => json);
}

const fetchRoomInfo = roomId => {
  return fetch(URL_LIVE_ROOM_INFO.replace("{roomid}", roomId))
    .then(res => res.json())
    .then(json => json);
}

const fetchLiveUrl = roomId => {
  return fetch(URL_LIVE_URL.replace("{roomid}", roomId))
    .then(res => res.json())
    .then(json => json);
}


/* 登录相关 */

const fetchAreaCode = () => {
  return fetch(URL_LOGIN_AREA_CODE)
    .then(res => res.json())
    .then(json => json);
}

const fetchGTCaptcha = () => {
  return fetch(URL_LOGIN_GT_CAPTCHA)
    .then(res => res.json())
    .then(json => json);
}

const fetchNavtUserInfo = cookie => {
  return fetch(URL_LOGIN_NAV_INFO, {
    method: "GET",
    headers: { "cookie": cookie } // 通过设置headers来发送cookie
  }).then(res => res.json())
    .then(json => json);
}

const fetchPWKeyAndHash = () => {
  return fetch(URL_LOGIN_PW_KEYHASH)
    .then(res => res.json())
    .then(json => json);
}

const fetchPWVerifyInfo = param => {
  // 需要将参数转换成字符串
  // 但是不能用JSON.toString，因为它转出来的是json字符串，不符合application/x-www-form-urlencoded类型的参数要求
  const searchParam = new URLSearchParams(Object.entries(param)).toString();

  return fetch(URL_LOGIN_PW_VERIFY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
    body: searchParam,
  }).then(res => res);
}

const fetchSMSVerifyInfo = param => {
  const searchParam = new URLSearchParams(Object.entries(param)).toString();

  return fetch(URL_LOGIN_SMS_VERIFY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: searchParam,
  }).then(res => res);
}

const fetchSMSCaptcha = param => {
  const searchParam = new URLSearchParams(Object.entries(param)).toString();

  return fetch(URL_LOGIN_SMS_CAPTCHA, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
    body: searchParam,
  }).then(res => res.json())
    .then(json => json);
}


/* 个人中心相关 */

const createFav = (param, cookie) => {
  const rawString = cookie;
  const bjctPos = rawString.indexOf("bili_jct");
  const bili_jct = rawString.substring(bjctPos + 9);
  const searchParam = new URLSearchParams(Object.entries(param)).toString() + `&csrf=${bili_jct}`;

  return fetch(URL_ME_CREATE_FAV, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      "cookie": cookie
    },
    body: searchParam,
  }).then(res => res.json())
    .then(json => json);
}

const delInvalidFavContent = (param, cookie) => {
  const rawString = cookie;
  const bjctPos = rawString.indexOf("bili_jct");
  const bili_jct = rawString.substring(bjctPos + 9);
  const searchParam = new URLSearchParams(Object.entries(param)).toString() + `&csrf=${bili_jct}`;

  return fetch(URL_ME_DEL_INVALID_FAV_CONTENT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      "cookie": cookie
    },
    body: searchParam,
  }).then(res => res.json())
    .then(json => json);
}

const deleteHistory = (params, cookie) => {
  const rawString = cookie;
  const bjctPos = rawString.indexOf("bili_jct");
  const bili_jct = rawString.substring(bjctPos + 9);
  const searchParam = new URLSearchParams(Object.entries(params)).toString() + `&csrf=${bili_jct}`;

  return fetch(URL_ME_DELETE_HISTORY, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      "cookie": cookie
    },
    body: searchParam,
  }).then(res => res.json())
    .then(json => json);
}

const editFav = (param, cookie) => {
  const rawString = cookie;
  const bjctPos = rawString.indexOf("bili_jct");
  const bili_jct = rawString.substring(bjctPos + 9);
  const searchParam = new URLSearchParams(Object.entries(param)).toString() + `&csrf=${bili_jct}`;

  return fetch(URL_ME_EDIT_FAV, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      "cookie": cookie
    },
    body: searchParam,
  }).then(res => res.json())
    .then(json => json);
}

const exitLogin = () => {
  return fetch(URL_ME_EXIT_LOGIN)
    .then(res => res);
}

const fetchHistory = (param, cookie) => {
  const searchParam = new URLSearchParams(Object.entries(param)).toString();
  const fetchUrl = URL_ME_GET_HISTORY + "?" + searchParam;

  return fetch(fetchUrl, {
    method: "GET",
    headers: { "cookie": cookie },
  }).then(res => res.json())
    .then(json => json);
}

const fetchMyRelation = cookie => {
  return fetch(URL_ME_MYRELATION, {
    method: "GET",
    headers: { "cookie": cookie },
  }).then(res => res.json())
    .then(json => json);
}


/* 排行榜相关 */

const fetchRankingById = rId => {
  return fetch(URL_RANKING.replace("{rid}", rId))
    .then(res => res.json())
    .then(json => json);
}

const fetchRankingArchiveById = (tId, p) => {
  return fetch(URL_RANKING_ARCHIVE.replace("{tid}", tId).replace("{p}", p))
    .then(res => res.json())
    .then(json => json);
}

const fetchRankingRegionById = (rId, day) => {
  return fetch(URL_RANKING_REGION.replace("{rid}", rId).replace("{day}", day))
    .then(res => res.json())
    .then(json => json);
}


/* 搜索相关 */

const fetchHotWord = () => {
  return fetch(URL_SEARCH_HOT_WORD)
    .then(res => res.json())
    .then(json => json);
}

const fetchSuggest = w => {
  const params = [
    "func=suggest",
    "suggest_type=accurate",
    "sub_type=tag",
    "main_ver=v1",
    "bangumi_acc_num=3",
    "tag_num=10",
    "highlight=",
    `term=${w}`
  ];
  return fetch(URL_SEARCH_SUGGEST + "?" + params.join("&"))
    .then(res => res.json())
    .then(json => json);
}

const fetchSearchContent = param => {
  param = {
    keyword: param.keyword,
    page: param.page,
    pagesize: param.size,
    search_type: param.searchType, // video（综合） media_bangumi(番剧) bili_user（up主）
    order: param.order // totalrank（默认） click（播放多） pubdate（发布日期） dm（弹幕）
  };
  return fetch(URL_SEARCH_SEARCH + `?${querystring.stringify(param)}`, {
    method: "get"
  }).then(res => res.json())
    .then(json => json);
}


/* 空间相关 */

const fetchFavDetail = (param, cookie) => {
  const { media_id, ps } = param;
  return fetch(`${URL_SPACE_FAV_DETAIL}?media_id=${media_id}&ps=${ps}`, {
    method: "GET",
    headers: { "cookie": cookie },
  }).then(res => res.json())
    .then(json => json);
}

const fetchFavInof = (param, cookie) => {
  return fetch(`${URL_SPACE_FAV_INFO}?media_id=${param}`, {
    method: "GET",
    headers: { "cookie": cookie },
  }).then(res => res.json())
    .then(json => json);
}

const fetchFavListCollected = (param, cookie) => {
  const searchParam = new URLSearchParams(Object.entries(param)).toString();

  return fetch(`${URL_SPACE_FAV_LIST_COLLECTED}?${searchParam}`, {
    method: "GET",
    headers: { "cookie": cookie },
  }).then(res => res.json())
    .then(json => json);
}

const fetchFavListCreated = (uid, cookie) => {
  const fetchUrl = `${URL_SPACE_FAV_LIST_CREATED}?up_mid=${uid}`;
  return fetch(fetchUrl, {
    method: "GET",
    headers: { "cookie": cookie },
  }).then(res => res.json())
    .then(json => json);
}

const fetchUserData = uId => {
  return Promise.all([
    fetch(URL_SPACE_USER_INFO.replace("{mid}", uId), { headers: { "User-Agent": userAgent } })
      .then(res => res.json())
      .then(body => body.data),

    fetch(URL_SPACE_USER_STATUS.replace("{mid}", uId))
      .then(res => res.json())
      .then(body => body.data)
  ]).then(([userInfo, status]) => {
    userInfo.status = status;
    return userInfo;
  });
}

const fetchRelation = uid => {
  return fetch(URL_UP_USER_STATUS.replace("{mid}", uid))
    .then(res => res.json())
    .then(body => body.data);
}

const fetchSeriesFollowed = (param, cookie) => {
  const searchParam = new URLSearchParams(Object.entries(param)).toString();

  return fetch(`${URL_SPACE_SERIES_FOLLOWED}?${searchParam}`, {
    method: "GET",
    headers: { "cookie": cookie },
  }).then(res => res.json())
    .then(json => json);
}

const fetchUserVideo = param => {
  return fetch(URL_SPACE_VIDEO.replace("{mid}", param.uId)
    .replace("{p}", param.p)
    .replace("{size}", param.size)
  ).then(res => res.json())
    .then(json => json);
}


/* 视频相关 */

const fetchBarrage = cId => {
  return fetch(URL_VIDEO_BARRAGE.replace("{cid}", cId))
    .then(res => res.text())
    .then(body => body)
}

const fetchVideoDetail = aId => {
  return fetch(URL_VIDEO_DETAIL.replace("{aid}", aId))
    .then(res => res.json())
    .then(json => json);
}

const fetchPlayUrl = (aId, cId) => {
  return fetch(URL_VIDEO_PLAY_URL.replace("{aid}", aId).replace("{cid}", cId))
    .then(res => res.json())
    .then(json => json);
}

const fetchRecommendById = aId => {
  return fetch(URL_VIDEO_RECOMMEND.replace("{aid}", aId))
    .then(res => res.json())
    .then(json => json);
}

const fetchReplay = (aId, p) => {
  return fetch(URL_VIDEO_REPLAY.replace("{oid}", aId).replace("{p}", p))
    .then(res => res.json())
    .then(json => json);
}

const postViewedReport = (param, cookie) => {
  const rawString = cookie;
  const bjctPos = rawString.indexOf("bili_jct");
  const bili_jct = rawString.substring(bjctPos + 9);
  const searchParam = new URLSearchParams(Object.entries(param)).toString() + `&csrf=${bili_jct}`;

  return fetch(URL_VIDEO_VIEWED_REPORT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      "cookie": cookie
    },
    body: searchParam,
  }).then(res => res.json())
    .then(json => json);
}


module.exports = {
  /* 综合相关 */
  fetchRoundSowing,
  /* 直播相关 */
  fetchLiveArea, fetchDanMuConfig, fetchLiveGift, fetchLiveList,
  fetchRoomList, fetchRoomInfo, fetchLiveUrl,
  /* 登录相关 */
  fetchAreaCode, fetchGTCaptcha, fetchNavtUserInfo, fetchPWKeyAndHash,
  fetchPWVerifyInfo, fetchSMSVerifyInfo, fetchSMSCaptcha,
  /* 个人中心相关 */
  createFav, delInvalidFavContent, deleteHistory, editFav, exitLogin,
  fetchHistory, fetchMyRelation,
  /* 排行榜相关 */
  fetchRankingById, fetchRankingArchiveById, fetchRankingRegionById,
  /* 搜索相关 */
  fetchHotWord, fetchSuggest, fetchSearchContent,
  /* 空间相关 */
  fetchFavDetail, fetchFavInof, fetchFavListCollected, fetchFavListCreated,
  fetchUserData, fetchRelation, fetchSeriesFollowed, fetchUserVideo,
  /* 视频相关 */
  fetchBarrage, fetchVideoDetail, fetchPlayUrl, fetchRecommendById,
  fetchReplay, postViewedReport
}
