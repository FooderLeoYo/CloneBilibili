const express = require("express");
const { fetchHistory } = require("../api");

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

module.exports = router;
