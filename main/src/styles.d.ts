// 本文件中，将各种样式css-modules均declare并export为style
// 则在组件中，import该module后，在需要用的地方只需用style代替即可

interface StyleModule {
  [key: string]: string;
}

declare module "*.css?css-modules" {
  // 定义常量style。类型为StyleModule
  const style: StyleModule;
  // 导出刚刚定义的常量style
  export default style;
}

declare module "*.less?css-modules" {
  const style: StyleModule;
  export default style;
}

declare module "*.sass?css-modules" {
  const style: StyleModule;
  export default style;
}

declare module "*.scss?css-modules" {
  const style: StyleModule;
  export default style;
}

declare module "*.styl?css-modules" {
  const style: StyleModule;
  export default style;
}
