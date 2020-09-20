// 根据终端决定图片后缀，Android使用.webp（只有Android支持），其余使用.jpg，

export function getPicSuffix(): string {
  const terminal = {
    isAndroid: /(Android)/i.test(navigator.userAgent)
  }
  let suffix

  if (terminal.isAndroid) {
    suffix = ".webp";
  } else {
    suffix = ".jpg";
  }

  return suffix;
}
