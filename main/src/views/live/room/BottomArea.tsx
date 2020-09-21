import * as React from "react";

import { getRoomGifts } from "../../../api/live";

import style from "./stylus/bottom-area.styl?css-modules";

interface BottomAreaProps {
  description: string;
}

const {
  useState,
  useEffect,
  useRef
} = React;

let chatDOM: HTMLDivElement = null;
let gifts: Array<any> = [];


// 将聊天消息显示到聊天区域
const sendMsg = msg => {
  // 这个不是一般的注释，而是禁止eslint对指定代码检测
  /* eslint-disable */

  // 由于BottomArea是Romm的子组件，因此在Room中会调用sendMsg再挂载BottomArea
  // 而Room一开始调用sendMsg的时候，聊天区DOM节点还没生成，所以要做判断
  if (!chatDOM) {
    return;
  }


  const div = document.createElement("div");
  div.className = style.chatMsg;

  // 根据信息类型创建div
  switch (msg.cmd) {
    case "DANMU_MSG":
      const manager = msg.info[2][2] === 1 ? `<span class="${style.msgManager}">房管</span>` : "";
      div.innerHTML = `${manager}<span class="${style.msgName}">${msg.info[2][1]}: </span>` +
        `${msg.info[1]}`;
      break;
    case "SEND_GIFT":
      div.classList.add(style.gift);
      const gift = gifts.find(gift => gift.id === msg.data.giftId);
      div.innerHTML = `<span class="${style.msgName}">${msg.data.uname} </span>` +
        `${msg.data.action}${msg.data.giftName} <img src="${gift.img}"` +
        `style="width: 1rem; vertical-align: middle" /> x ${msg.data.num}`;
      break;
    case "WELCOME":
      const isSvip = msg.data.svip ? true : false;
      isSvip ? div.classList.add(style.svip) : div.classList.add(style.vip);
      const call = isSvip ? "年费老爷" : "老爷";
      div.innerHTML = `<span class="${style.msgName}">${msg.data.uname} ${call} </span>` +
        `进入直播间`;
      break;
    default:
  }

  // 将新聊天消息div添加到聊天区域，且保证新消息处于最底部
  // 延时执行，避免并发造成dom计算不准确
  setTimeout(() => {
    let needScroll = false;
    // 当所有内容的总高度大于上面被卷去部分高度加可视区高度时，需要滚动
    if (chatDOM.scrollHeight >
      Math.ceil(chatDOM.scrollTop) + chatDOM.clientHeight) {
      needScroll = true;
    }
    chatDOM.appendChild(div);
    // 如果聊天区域添加了新消息div，则滚动chatDOM使得新消息处于最底部
    if (needScroll) {
      chatDOM.scrollTop = chatDOM.scrollHeight - chatDOM.clientHeight;
    }
  }, 100);
}

function BottomArea(props: BottomAreaProps) {
  const { description } = props;
  const [index, setIndex] = useState(0);

  const chatRef: React.RefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    chatDOM = chatRef.current;

    // 消息超过1000条，则清理前1000条消息
    setInterval(() => {
      const children = chatDOM.children;
      if (children.length > 1000) {
        // Array.from是浅拷贝，只拷贝引用而不是创造一个一样的新对象
        // 因此removeChild就会根据child这个引用找到并删除children中对应的内容
        const subChildren = Array.from(children).slice(0, children.length - 1000);
        subChildren.forEach(child => {
          chatDOM.removeChild(child);
        });
      }
    }, 5000);

    // 如果消息中包含gift数据，则将它赋给gifts
    getRoomGifts().then(result => {
      if (result.code === "1") {
        gifts = result.data;
      }
    });
  }, []);

  return (
    <div className={style.tabWrapper}>
      {/* tab栏 */}
      <div className={style.tabItemWrapper}>
        <div className={style.tabItem + (index === 0 ? " " + style.active : "")}
          onClick={() => {
            setIndex(0);
          }}>互动</div>
        <div className={style.tabItem + (index === 1 ? " " + style.active : "")}
          onClick={() => {
            setIndex(1);
          }}>简介</div>
      </div>
      {/* 底部内容区 */}
      <div className={style.tabContentWrapper}>
        {/* 互动 */}
        <div
          className={style.tabContent}
          style={{ display: (index === 0 ? "block" : "none") }}
        >
          <div className={style.chatContainer} ref={chatRef}>
          </div>
        </div>
        {/* 简介 */}
        <div
          className={style.tabContent}
          style={{ display: (index === 1 ? "block" : "none") }}
        >
          <div
            className={style.desc}
            // description是一段纯html而非字符串，因此要用dangerouslySetInnerHTML
            dangerouslySetInnerHTML={{ __html: description }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default BottomArea;

export { sendMsg };
