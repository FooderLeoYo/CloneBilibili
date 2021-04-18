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
  // const param = {
  //   captchaType: 6,
  //   username: req.body.username,
  //   password: req.body.password,
  //   keep: true,
  //   key: req.body.key,
  //   challenge: req.body.challenge,
  //   validate: req.body.challenge,
  //   seccode: req.body.seccode
  // }
  fetchLoginVerifyInfo(req.body).then(data => {
    console.log(data)
    let resData = {
      code: "1",
      msg: "success",
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

module.exports = router;
