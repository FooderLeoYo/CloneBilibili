// 这个文件导出的是views中的各组件在开发、生产不同环境下所需的图片/视频url
// 这里只是在dev.env.js、prod.env.js中将URL_PREFIX设置成一样的，当然也可以是不同的

import * as React from "react";

export const context = {
  // URL_PREFIX在front/config/dev.env.js或prod.env.js中
  picURL: process.env.URL_PREFIX + "/transfer/image",
  videoURL: process.env.URL_PREFIX + "/transfer/video"
};

export default React.createContext(context);
