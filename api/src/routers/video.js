const express = require("express");
const { fetchVideoDetail, fetchPlayUrl, fetchRecommendById, fetchReplay,
  fetchBarrage, postViewedReport, sendBarr, fetchBarrLikeCount } = require("../api");
// xml2js的作用是将后台返回的 xml 代码转换为前台可使用的 json 格式的字符串
const { parseString } = require("xml2js");
// const protobuf = require("protocol-buffers");
// const fs = require('fs')
// let messages = protobuf(fs.readFileSync(__dirname + '/v1.proto'))
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

router.get("/av/getbarr", (req, res, next) => {
  // fetchBarrage(req.query).then(data => {
  //   let resData = {
  //     code: "1",
  //     msg: "success",
  //     data: []
  //   }

  //   if (data) {
  //     console.log(data.body._handle.buffer)
  //     console.log(typeof (data))

  //     protobuf.load("./src/proto/v1.proto", (err, root) => {
  //       if (err) { throw err }
  //       const tempMes = root.lookupType("bilibili.community.service.dm.v1.DanmakuElem");
  //       const errMsg = tempMes.verify(data.body._handle.buffer)
  //       if (errMsg) { console.log(errMsg) }
  //       const decodedMes = tempMes.decode(data.body._handle.buffer);
  //       // resData.data = decodedMes;
  //     })
  //     // const decodedMes = messages.DmSegMobileReply.decode(data.body._handle.buffer);
  //     // console.log(decodedMes)
  //     // resData.data = decodedMes;
  //   } else {
  //     resData.code = "0";
  //     resData.msg = "fail";
  //   }
  //   res.send(resData);
  // }).catch(next);
  fetchBarrage(req.query.cId).then(xml => {
    parseString(xml, { explicitArray: false, trim: true }, (err, result) => {
      if (!err) {
        let resData = {
          code: "1",
          msg: "success",
          data: []
        }
        const barrData = result.i.d;
        const convertFormat = item => {
          let p = item.$.p;
          const attrs = p.split(",");
          resData.data.push({
            time: attrs[0],  // 视频内弹幕出现时间
            type: attrs[1],  // 弹幕类型：位置、互动、高级等
            size: attrs[2], // 字号
            decimalColor: attrs[3],  // 十进制颜色
            sendTime: attrs[4],   // 发送时间
            uidHash: attrs[6], // 发送者UID的HASH
            dmid: attrs[7], // 弹幕dmid
            content: item._,  // 内容
            p // 格式化前原数据
          });
        };
        if (barrData) {
          if (barrData.length) { barrData.forEach(item => convertFormat(item)) }
          else { convertFormat(barrData) }
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
    if (data.code !== 0) {
      resData.code = "0";
      resData.msg = "fail";
    }
    res.send(resData);
  }).catch(next);
});

router.post("/av/sendbarr", (req, res, next) => {
  sendBarr(req.body, req.headers.cookie).then(data => {
    let resData = {
      code: "1",
      msg: "success",
      data
    }
    if (data.code !== 0) {
      resData.code = "0";
      resData.msg = "fail";
    }
    res.send(resData);
  }).catch(next);
});

router.post("/av/thumbupbarr", (req, res, next) => {
  thumbupBarr(req.body, req.headers.cookie).then(data => {
    let resData = {
      code: "1",
      msg: "success",
      data
    }
    if (data.code !== 0) {
      resData.code = "0";
      resData.msg = "fail";
    }
    res.send(resData);
  }).catch(next);
});

router.get("/av/getbarrlikecount", (req, res, next) => {
  fetchBarrLikeCount(req.query, req.headers.cookie).then(data => {
    let resData = {
      code: "1",
      msg: "success"
    }
    if (data.code === 0) { resData.data = data; }
    else {
      resData.code = "0";
      resData.msg = "fail";
      resData.data = data;
    }
    res.send(resData);
  }).catch(next);
});

module.exports = router;
