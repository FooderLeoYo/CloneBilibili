const express = require("express");
const { fetchGTCaptcha, fetchPWKeyAndHash, fetchLoginVerifyInfo } = require("../api");

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
  fetchLoginVerifyInfo(req.body).then(data => {
    let resData = {
      code: "1",
      msg: "success",
    }

    if (data) {
      if (data.headers.has('set-cookie')) { // 登录成功则设置4个cookie
        const rawSetting = data.headers.get('set-cookie');
        const DUIdC5Pos = rawSetting.indexOf("DedeUserID__ckMd5");
        const SDataPos = rawSetting.indexOf("SESSDATA");
        const bjctPos = rawSetting.indexOf("bili_jct");
        res.setHeader("Set-Cookie", [
          rawSetting.substring(0, DUIdC5Pos - 2),
          rawSetting.substring(DUIdC5Pos, SDataPos - 2),
          rawSetting.substring(SDataPos, bjctPos - 2),
          rawSetting.substring(bjctPos)
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

module.exports = router;
