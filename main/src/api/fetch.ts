// 这个文件的作用是为/api中的各组件数据请求方法文件提供getJSON和postJSON方法

import fetch from "cross-fetch"; // 由于目前大多数浏览器原生还不支持fetch，因此需要使用cross-fetc第三方库

export function getJSON(url: string, data) {
  let param = "";
  if (data) {
    const datas = [];
    for (const k in data) {
      if (k) {
        datas.push(`${k}=${data[k]}`);
      }
    }
    if (datas.length > 0) {
      param = "?" + datas.join("&");
    }
  }
  return fetch(url + param, {
    method: "GET",
    credentials: 'include' // fetch发送请求默认是不发送cookie的，设置此项后才可以在request headers中带cookie
  }).then(res => {
    if (res.ok) { return res.json(); } // res.ok是fetch自带的判断请求是否成功的方法
    throw new Error(res.statusText);
  })
}

export function postJSON(url: string, data) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json; charset=utf-8", },
    credentials: "include" // fetch默认对服务端通过Set-Cookie头设置的cookie也会忽略，若想选择接受来自服务端的cookie信息，也必须要配置credentials选项
  }).then(res => {
    if (res.ok) { return res.json(); }
    throw new Error(res.statusText);
  })
}
