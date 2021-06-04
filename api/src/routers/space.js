const express = require("express");
const { fetchHistory, fetchRelation } = require("../api");

const router = express.Router();

router.get("/space/gethistory", (req, res, next) => {
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
