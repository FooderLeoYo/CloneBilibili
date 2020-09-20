module.exports = (req, res, next) => {
  // req.get方法returns the specified HTTP request header field
  const userAgent = req.get("User-Agent");
  // User-Agent是一个请求头的一个属性
  if (userAgent) {
    // Googlebot是google爬虫
    if (userAgent.indexOf("Googlebot") !== -1) {
      // Access is not allowed
      res.status(403).end();
      return;
    }
  }
  next();
}
