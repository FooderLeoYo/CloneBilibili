/**
 * 格式化数字
 * 1218807 => 121.9万
 */
export function formatTenThousand(num: number): string {
  const numStr = String(num);
  if (numStr.length <= 4) {
    return numStr;
  }

  let wholeNumber = numStr.substring(0, numStr.length - 4);
  // 千位往右的数
  const thousands = numStr.substring(numStr.length - 4);
  // 千.百，然后利用toFixed(0)四舍五入只保留千位
  let decimalNumber = Number(thousands.substring(0, 1) + "." +
    thousands.substring(1)).toFixed(0);

  // 如果decimalNumber有两位，则说明thousands大于9500，四舍五入后为10000
  if (decimalNumber.length === 2) {
    decimalNumber = "0";
    wholeNumber = String(Number(wholeNumber) + 1);
  }

  return `${wholeNumber}.${decimalNumber}万`;
}

/**
 * 格式秒时间
 * second: 120
 * format
 * 0#:## => 02:00
 * ##:## => 2:00
 * 0#:##:## => 00:02:00
 * ##:##:## => 0:02:00
 */
// 这里当然可以直接将second取商即得时分秒，用到Date是为了练习Date的使用方法
export function formatDuration(second: number, format: string): string {
  // new Date()括号里不带参数时，得到的是当前时间
  // 这里new的目的是为了获取今天的“年”、“月”、“日”
  let date = new Date();
  // new Date()括号里带参数时，得到的是所传参数的世间
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  // second加上年月日后才能传进Date()中生成Date对象newDate
  const tempstamp = date.getTime() + second * 1000;
  // 从服务端拿到的second是时间戳，因此要传进Date()中才能取出时分秒
  const newDate = new Date(tempstamp);
  const hours = newDate.getHours();
  const minutes = newDate.getMinutes();
  const seconds = newDate.getSeconds();
  // 小于10则十位补0
  const toStr = num => {
    return num < 10 ? "0" + num : num;
  }
  let duration = `${toStr(hours)}:${toStr(minutes)}:${toStr(seconds)}`;

  if (format) {
    const formats = format.split(":");
    if (formats.length === 3) { // 如果有小时
      duration = duration.match(/\d{2}:\d{2}:\d{2}$/)[0];
    } else if (formats.length === 2) { // 如果没有小时
      duration = duration.match(/\d{2}:\d{2}$/)[0];
    }
    // 如果format为##:##或##:##:##
    if (format.indexOf("0") === -1) {
      duration = duration.replace(duration.charAt(0), "");
    }
  }

  return duration;
}
