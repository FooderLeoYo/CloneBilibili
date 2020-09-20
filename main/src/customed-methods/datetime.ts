export function formatDate(date: Date, format: string): string {
  const reg = {
    "M+": date.getMonth() + 1,               // 月份
    "d+": date.getDate(),                    // 日
    "h+": date.getHours(),                   // 小时
    "m+": date.getMinutes(),                 // 分
    "s+": date.getSeconds(),                 // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
    "S": date.getMilliseconds()             // 毫秒
  };
  // 如果format含“年”
  if (/(y+)/i.test(format)) {
    // 将date的“年”换成format的格式的具体年份，如date为1991format是2位则substr成91
    format = format.replace(
      // RegExp.$1取到之前使用正则表达式的地方的第一个分组，即(y+)的匹配结果
      RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  }

  for (const k in reg) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1,
        // 如果k是一位的，比如季度，则直接用
        RegExp.$1.length === 1 ? reg[k] :
          // 如果k是两位的，则前面补0再截取
          // 例如，12变成0012然后substr(2)变成12；2变成002然后substr(1)变成02
          ("00" + reg[k]).substr(("" + reg[k]).length));
    }
  }

  return format;
}
