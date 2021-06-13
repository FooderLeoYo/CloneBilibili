const express = require("express");
const { fetchFavListCollected, fetchFavListCreated, fetchUserData,
  fetchUserVideo, fetchRelation, fetchSeriesFollowed,
  fetchFavInof } = require("../api");

const router = express.Router();

router.get("/space/getfavinfo", (req, res, next) => {
  fetchFavInof(req.query.media_id, req.headers.cookie).then(data => {
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

router.get("/space/getfavlistcollected", (req, res, next) => {
  const { ps, pn, up_mid } = req.query;
  const params = { ps, pn, up_mid };

  fetchFavListCollected(params, req.headers.cookie).then(data => {
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

router.get("/space/getfavlistcreated", (req, res, next) => {
  fetchFavListCreated(req.query.uid, req.headers.cookie).then(data => {
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

router.get("/space/userinfo", (req, res, next) => {
  fetchUserData(req.query.mId).then(data => {
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

router.get("/space/getrelation", (req, res, next) => {
  fetchRelation(req.query.uid).then(data => {
    const resData = {
      code: "1",
      msg: "success",
      data
    }
    res.send(resData);
  }).catch(next);
});

router.get("/space/getseriesfollowed", (req, res, next) => {
  const { vmid, type, pn, ps } = req.query;
  const params = { vmid, type, pn, ps };

  console.log(params)

  fetchSeriesFollowed(params, req.headers.cookie).then(data => {
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

module.exports = router;
