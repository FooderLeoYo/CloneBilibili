// 这个文件的作用是为/api中的各组件数据请求方法文件提供getJSON和postJSON方法

// fetch是XMLHttpRequest的一种替代方案，是原生js
// 由于目前大多数浏览器原生还不支持fetch，因此需要使用cross-fetc第三方库
import fetch from "cross-fetch";

// 将url拼接上query参数后，发送fetch请求拿到json数据
export function getJSON(url: string, data) {
  let param = "";
  if (data) {
    const datas = [];
    // for in的k是data的属性名，data[k]是属性k的属性值
    for (const k in data) {
      if (k) {
        datas.push(`${k}=${data[k]}`);
      }
    }
    if (datas.length > 0) {
      // join()方法用于把数组中的所有元素放入一个字符串，并用&分割
      param = "?" + datas.join("&");
    }
  }
  return fetch(url + param, {
    method: "GET",
    credentials: 'include'
  }).then((res) => {
    // res.ok是fetch自带的判断请求是否成功的方法
    if (res.ok) { return res.json(); }
    throw new Error(res.statusText);
  })
}

export function postJSON(url: string, data) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json; charset=utf-8", },
    credentials: "include"
  }).then(res => {
    if (res.ok) {
      return res.json();
    }
    throw new Error(res.statusText);
  })
}
