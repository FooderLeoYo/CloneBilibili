const express = require("express");
const { fetchMyRelation, fetchHistory, deleteHistory, exitLogin,
  editFav, createFav, delInvalidFavContent, fetchLater
} = require("../api");
const router = express.Router();

router.get("/me/getmyrelation", (req, res, next) => {
  fetchMyRelation(req.headers.cookie).then(data => {
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

router.get("/me/gethistory", (req, res, next) => {
  fetchHistory(req.query, req.headers.cookie).then(data => {
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

router.get("/me/getlater", (req, res, next) => {
  fetchLater(req.headers.cookie).then(data => {
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

router.post("/me/deletehistory", (req, res, next) => {
  deleteHistory(req.body, req.headers.cookie).then(data => {
    let resData = {
      code: "1",
      msg: "success",
    }
    if (data.code != 0) {
      resData.code = "0";
      resData.msg = "fail";
    }
    resData.data = data;

    res.send(resData);
  }).catch(next);
});

router.post("/me/editfav", (req, res, next) => {
  editFav(req.body, req.headers.cookie).then(data => {
    let resData = {
      code: "1",
      msg: "success",
    }
    if (data.code != 0) {
      resData.code = "0";
      resData.msg = "fail";
    }
    resData.data = data;

    res.send(resData);
  }).catch(next);
});

router.post("/me/createfav", (req, res, next) => {
  createFav(req.body, req.headers.cookie).then(data => {
    let resData = {
      code: "1",
      msg: "success",
    }
    if (data.code != 0) {
      resData.code = "0";
      resData.msg = "fail";
    }
    resData.data = data;

    res.send(resData);
  }).catch(next);
});

router.post("/me/delinvalidfavcontent", (req, res, next) => {
  delInvalidFavContent(req.body, req.headers.cookie).then(data => {
    let resData = {
      code: "1",
      msg: "success",
    }
    if (data.code != 0) {
      resData.code = "0";
      resData.msg = "fail";
    }
    resData.data = data;

    res.send(resData);
  }).catch(next);
});

router.get("/me/exitlogin", (req, res, next) => {
  exitLogin().then(data => {
    // let resData = {
    //   code: "1",
    //   msg: "success",
    // }

    // if (data) {
    //   // 登录成功则response headers中会有4个set-cookie
    //   if (data.headers.has('set-cookie')) {
    //     const rawSetting = data.headers.get('set-cookie'); // 由于数据类型原因，set-cookie的值不能通过“.”获取，只能通过get方法
    //     const DUIdC5Pos = rawSetting.indexOf("DedeUserID__ckMd5");
    //     const SDataPos = rawSetting.indexOf("SESSDATA");
    //     const bjctPos = rawSetting.indexOf("bili_jct");
    //     res.setHeader("Set-Cookie", [
    //       // 由于原始数据的4个cookie是连在一起的，因此要手动依次截取
    //       // 因为本项目的Domain非bilibili.com，因此删掉原Domain
    //       rawSetting.substring(0, DUIdC5Pos - 2).replace(" Domain=.bilibili.com;", ""),
    //       rawSetting.substring(DUIdC5Pos, SDataPos - 2).replace(" Domain=.bilibili.com;", ""),
    //       rawSetting.substring(SDataPos, bjctPos - 2).replace(" Domain=.bilibili.com;", ""),
    //       rawSetting.substring(bjctPos).replace(" Domain=.bilibili.com;", "")
    //     ]);
    //   }

    //   data.json().then(json => {
    //     resData.data = json;
    //     res.send(resData);
    //   });
    // } else {
    //   resData.code = "0";
    //   resData.msg = "fail";
    //   res.send(resData);
    // }
    // console.log(data.headers.get('set-cookie'))
    console.log(data)
  }).catch(next);
});

module.exports = router;
