const express = require("express");
const { fetchVideoDetail, fetchPlayUrl, fetchRecommendById, fetchReplay,
  fetchBarrage, postViewedReport } = require("../api");
// xml2js的作用是将后台返回的 xml 代码转换为前台可使用的 json 格式的字符串
const { parseString } = require("xml2js");
const router = express.Router();

// 视频详情
router.get("/av/info", (req, res, next) => {
  fetchVideoDetail(req.query.aId).then(data => {
    const resData = {
      code: "1",
      msg: "success",
      data
    }
    if (data.code === 0) {
      resData.data = data.data;
    } else {
      resData.code = "0";
      resData.msg = "fail";
    }
    res.send(resData);
  }).catch(next);
});

// 视频地址
router.get("/av/play_url", (req, res, next) => {
  const { aId, cId } = req.query;
  fetchPlayUrl(aId, cId).then(data => {
    let resData = {
      code: "1",
      msg: "success"
    }
    if (data.code === 0) {
      resData.data = data.data;
    } else {
      resData.code = "0";
      resData.msg = "fail";
    }
    res.send(resData);
  }).catch(next);
});

router.get("/av/recommend/", (req, res, next) => {
  fetchRecommendById(req.query.aId).then(data => {
    let resData = {
      code: "1",
      msg: "success"
    }
    if (data.code === 0) {
      resData.data = data.data;
    } else {
      resData.code = "0";
      resData.msg = "fail";
    }
    res.send(resData);
  }).catch(next);
});

router.get("/av/replay", (req, res, next) => {
  let aId = req.query.aId;
  let p = req.query.p;
  fetchReplay(aId, p).then(data => {
    let resData = {
      code: "1",
      msg: "success"
    }
    if (data.code === 0) {
      resData.data = data.data;
    } else {
      resData.code = "0";
      resData.msg = "fail";
    }
    res.send(resData);
  }).catch(next);
});

router.get("/av/barrage", (req, res, next) => {
  fetchBarrage(req.query.cId).then(xml => {
    parseString(xml, { explicitArray: false, trim: true }, (err, result) => {
      if (!err) {
        let resData = {
          code: "1",
          msg: "success",
          data: []
        }
        if (result.i.d) {
          result.i.d.forEach(item => {
            let p = item.$.p;
            let attrs = p.split(",");
            resData.data.push({
              time: attrs[0],  // 时间
              type: attrs[1],  // 类型
              decimalColor: attrs[3],  // 十进制颜色
              sendTime: attrs[4],   // 发送时间
              content: item._,  // 内容
              p
            });
          });
        }
        res.send(resData);
      } else {
        next(err);
      }
    });

  }).catch(next);
});

router.post("/av/report", (req, res, next) => {
  postViewedReport(req.body, req.headers.cookie).then(data => {
    let resData = {
      code: "1",
      msg: "success",
      data
    }
    if (data.code != 0) {
      resData.code = "0";
      resData.msg = "fail";
    }
    res.send(resData);
  }).catch(next);
});

module.exports = router;
