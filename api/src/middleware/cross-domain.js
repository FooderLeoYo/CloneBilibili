const whiteList = process.env.WHITE_LIST.split(",");// 白名单可能不止一个

module.exports = (req, res, next) => {
  const origin = req.get("Origin");
  if (origin) {
    const allowOrigin = whiteList.find(url => origin.indexOf(url) !== -1);
    if (allowOrigin) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.header("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
      res.header("Access-Control-Allow-Credentials", true);
    }
  }
  next();
}
