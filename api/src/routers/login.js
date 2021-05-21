const express = require("express");
const { fetchGTCaptcha, fetchPWKeyAndHash, fetchPWVerifyInfo, fetchNavtUserInfo,
  fetchAreaCode, fetchSMSCaptcha, fetchSMSVerifyInfo, exitLogin } = require("../api");

const router = express.Router();

router.get("/login/getgtcaptcha", (req, res, next) => {
  fetchGTCaptcha().then(data => {
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

router.get("/login/getpwkeyhash", (req, res, next) => {
  fetchPWKeyAndHash().then(data => {
    let resData = {
      code: "1",
      msg: "success"
    }
    if (data) {
      resData.data = data;
    } else {
      resData.code = "0";
      resData.msg = "fail";
    }
    res.send(resData);
  }).catch(next);
});

router.post("/login/verifypassword", (req, res, next) => {
  fetchPWVerifyInfo(req.body).then(data => {
    let resData = {
      code: "1",
      msg: "success",
    }

    if (data) {
      // 登录成功则response headers中会有4个set-cookie
      if (data.headers.has('set-cookie')) {
        const rawSetting = data.headers.get('set-cookie'); // 由于数据类型原因，set-cookie的值不能通过“.”获取，只能通过get方法
        const DUIdC5Pos = rawSetting.indexOf("DedeUserID__ckMd5");
        const SDataPos = rawSetting.indexOf("SESSDATA");
        const bjctPos = rawSetting.indexOf("bili_jct");
        res.setHeader("Set-Cookie", [
          // 由于原始数据的4个cookie是连在一起的，因此要手动依次截取
          // 因为本项目的Domain非bilibili.com，因此删掉原Domain
          rawSetting.substring(0, DUIdC5Pos - 2).replace(" Domain=.bilibili.com;", ""),
          rawSetting.substring(DUIdC5Pos, SDataPos - 2).replace(" Domain=.bilibili.com;", ""),
          rawSetting.substring(SDataPos, bjctPos - 2).replace(" Domain=.bilibili.com;", ""),
          rawSetting.substring(bjctPos).replace(" Domain=.bilibili.com;", "")
        ]);
      }

      data.json().then(json => {
        resData.json = json;
        res.send(resData);
      });
    } else {
      resData.code = "0";
      resData.msg = "fail";
      res.send(resData);
    }
  }).catch(next);
});

router.get("/login/getnavuserinfo", (req, res, next) => {
  // 由于经过了router处理，因此fetchNavtUserInfo时请求头中是没有cookie的
  // 需要先从req中手动提取出来，再通过设置fetch的headers，cookie才能被成功发送
  fetchNavtUserInfo(req.headers.cookie).then(data => {
    let resData = {
      code: "1",
      msg: "success"
    }
    if (data.code === 0) { resData.data = data.data; }
    else {
      resData.code = "0";
      resData.msg = "fail";
      resData.data = data;
    }
    res.send(resData);
  }).catch(next);
});

router.get("/login/getareacode", (req, res, next) => {
  fetchAreaCode().then(data => {
    let resData = {
      code: "1",
      msg: "success"
    }
    if (data) {
      resData.data = data.data;
    } else {
      resData.code = "0";
      resData.msg = "fail";
    }
    res.send(resData);
  }).catch(next);
});

router.post("/login/getsmscaptcha", (req, res, next) => {
  fetchSMSCaptcha(req.body).then(data => {
    let resData = {
      code: "1",
      msg: "success",
    }
    if (data.code != 0) {
      resData.code = "0";
      resData.msg = "fail";
    }
    resData.message = data.message;

    res.send(resData);
  }).catch(next);
});

router.post("/login/verifysms", (req, res, next) => {
  fetchSMSVerifyInfo(req.body).then(data => {
    let resData = {
      code: "1",
      msg: "success",
    }

    if (data) {
      // 登录成功则response headers中会有4个set-cookie
      if (data.headers.has('set-cookie')) {
        const rawSetting = data.headers.get('set-cookie'); // 由于数据类型原因，set-cookie的值不能通过“.”获取，只能通过get方法
        const DUIdC5Pos = rawSetting.indexOf("DedeUserID__ckMd5");
        const SDataPos = rawSetting.indexOf("SESSDATA");
        const bjctPos = rawSetting.indexOf("bili_jct");
        res.setHeader("Set-Cookie", [
          // 由于原始数据的4个cookie是连在一起的，因此要手动依次截取
          // 因为本项目的Domain非bilibili.com，因此删掉原Domain
          rawSetting.substring(0, DUIdC5Pos - 2).replace(" Domain=.bilibili.com;", ""),
          rawSetting.substring(DUIdC5Pos, SDataPos - 2).replace(" Domain=.bilibili.com;", ""),
          rawSetting.substring(SDataPos, bjctPos - 2).replace(" Domain=.bilibili.com;", ""),
          rawSetting.substring(bjctPos).replace(" Domain=.bilibili.com;", "")
        ]);
      }

      data.json().then(json => {
        resData.data = json;
        res.send(resData);
      });
    } else {
      resData.code = "0";
      resData.msg = "fail";
      res.send(resData);
    }
  }).catch(next);
});

router.get("/login/exitlogin", (req, res, next) => {
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
