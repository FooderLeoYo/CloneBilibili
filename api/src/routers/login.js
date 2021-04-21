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
    console.log(data.headers.entries())
    // const tmp = data.headers.entries();
    // res.setHeader(tmp);

    return data.json();
    // console.log(data)
    // let resData = {
    //   code: "1",
    //   msg: "success",
    // }
    // if (data.code === 0) {
    //   resData.data = data;
    // } else {
    //   resData.code = "0";
    //   resData.msg = "fail";
    // }
    // res.send(resData);
    // res.send(data)
  })
    .then(json => res.send(json))
    .catch(next);
});

module.exports = router;
