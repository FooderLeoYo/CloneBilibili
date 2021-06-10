const express = require("express");
const { fetchFavListCreated, fetchUserData, fetchUserVideo, fetchRelation } = require("../api");

const router = express.Router();

router.get("/space/getfavlistcreated/:uid", (req, res, next) => {
  fetchFavListCreated(req.params.uid, req.headers.cookie).then(data => {
    const resData = {
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

router.get("/space/:uId", (req, res, next) => {
  if (req.path === "/space/video") {
    next();
    return;
  }
  fetchUserData(req.params.uId).then(data => {
    const resData = {
      code: "1",
      msg: "success",
      data
    }
    res.send(resData);
  }).catch(next);
});

router.get("/space/video", (req, res, next) => {
  const param = {
    uId: req.query.uId,
    p: req.query.p,
    size: req.query.size
  }
  fetchUserVideo(param).then(data => {
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

router.get("/space/getrelation/:uid", (req, res, next) => {
  fetchRelation(req.params.uid).then(data => {
    const resData = {
      code: "1",
      msg: "success",
      data
    }
    res.send(resData);
  }).catch(next);
});

module.exports = router;
