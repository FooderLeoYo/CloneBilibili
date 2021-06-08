const express = require("express");
const { fetchRelation } = require("../api");

const router = express.Router();


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
