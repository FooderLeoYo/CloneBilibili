const express = require("express");
const mainRouter = require("./main");
const rankingRouter = require("./ranking");
const videoRouter = require("./video");
const searchRouter = require("./search");
const transferRouter = require("./transfer");
const liveRouter = require("./live");
const loginRouter = require("./login");
const spaceRouter = require("./space");
const meRouter = require("./me");


const router = express.Router();

router.use(mainRouter);
router.use(rankingRouter);
router.use(videoRouter);
router.use(searchRouter);
router.use(transferRouter);
router.use(liveRouter);
router.use(loginRouter);
router.use(spaceRouter);
router.use(meRouter);

module.exports = router;
