// 这个文件的作用是为ChatWebSocket实例绑定事件监听器

// pako用来处理文件压缩
import pako from "pako";

declare global {
  interface Window {
    escape: (str: string) => string;
  }
}

class resObj {
  public packetLen?: number;
  public headerLen?: number;
  public ver?: number;
  public op?: number;
  public seq?: number;
  public body: any;
}

const wsConstant = {
  WS_OP_HEARTBEAT: 2,  // 心跳
  WS_OP_HEARTBEAT_REPLY: 3,  // 心跳回应
  WS_OP_MESSAGE: 5,  // 弹幕，通知等
  WS_OP_USER_AUTHENTICATION: 7,  // 进房
  WS_OP_CONNECT_SUCCESS: 8,  // 进房回应
  WS_PACKAGE_HEADER_TOTAL_LENGTH: 16,
  WS_PACKAGE_OFFSET: 0,
  WS_HEADER_OFFSET: 4,
  WS_VERSION_OFFSET: 6,
  WS_OPERATION_OFFSET: 8,
  WS_SEQUENCE_OFFSET: 12,
  WS_BODY_PROTOCOL_VERSION_NORMAL: 0,  // 协议：内容为JSON
  WS_BODY_PROTOCOL_VERSION_DEFLATE: 2, // 协议：内容为压缩后的buffer
  WS_HEADER_DEFAULT_VERSION: 1,
  WS_HEADER_DEFAULT_OPERATION: 1,
  WS_HEADER_DEFAULT_SEQUENCE: 1
};

// 数据包头
const wsHeaderList = [
  {
    name: "Packet Length",
    key: "packetLen",
    bytes: 4,  // 长度
    offset: wsConstant.WS_PACKAGE_OFFSET,  // 偏移量
    value: 0
  },
  {
    name: "Header Length",
    key: "headerLen",
    bytes: 2,
    offset: wsConstant.WS_HEADER_OFFSET,
    value: wsConstant.WS_PACKAGE_HEADER_TOTAL_LENGTH
  },
  {
    name: "Protocol Version",
    key: "ver",
    bytes: 2,
    offset: wsConstant.WS_VERSION_OFFSET,
    value: wsConstant.WS_BODY_PROTOCOL_VERSION_NORMAL
  },
  {
    name: "Operation",
    key: "op",
    bytes: 4,
    offset: wsConstant.WS_OPERATION_OFFSET,
    value: wsConstant.WS_OP_USER_AUTHENTICATION
  },
  {
    name: "Sequence Id",
    key: "seq",
    bytes: 4,
    offset: wsConstant.WS_SEQUENCE_OFFSET,
    value: wsConstant.WS_HEADER_DEFAULT_SEQUENCE
  }];

export enum Events {
  HEARTBEAT_REPLY = "HEARTBEAT_REPLY",
  MESSAGE_RECEIVE = "MESSAGE_RECEIVE"
}

export default class ChatWebSocket {
  private webSocket: WebSocket;
  private heartBeatInterval: number;
  private eventHandle: Map<Events, (body: any) => void>;
  public constructor(url: string, public roomId: number) {
    // new执行以后，客户端就会与服务器进行连接，不需要手动send任何信息
    this.webSocket = new WebSocket(url);
    // ArrayBuffer的数据，是可以按照字节去操作的，而Blob的只能作为一个整的对象去处理
    // 可以说，ArrayBuffer相比Blob更接近真实的二进制，更底层
    this.webSocket.binaryType = "arraybuffer";

    this.eventHandle = new Map();

    // 为ChatWebSocket实例添加4个事件listener
    this.init();
  }

  /* 以下为自定义方法 */
  // 暴露给外部，以供绑定事件处理函数
  public on(event: Events, callback) {
    this.eventHandle.set(event, callback);
  }

  private init() {
    // 通信建立后，客户端向服务端发送进房信号
    // 如果客户端open被触发，那么说明服务器成功地处理了连接请求，并且同意与客户端通信
    this.webSocket.addEventListener("open", () => {
      const json = JSON.stringify({
        uid: 0,
        roomid: this.roomId,
        protover: 2
      });
      const arrayBuffer = this.convertToArrayBuffer(
        json, wsConstant.WS_OP_USER_AUTHENTICATION
      );
      // send是客户端发给服务端
      this.webSocket.send(arrayBuffer);

    });

    // 根据从服务端收到的数据类型采取相应的行动
    // message在客户端接收服务端数据时被触发
    this.webSocket.addEventListener("message", (event) => {
      const res = this.convertToObject(event.data);
      let callback: (body: any) => void;

      switch (res.op) {
        // 如果收到的是WS_OP_HEARTBEAT_REPLY，res.body将是当前的人气
        // 它会通过callback传给Room.tsx，Room.tsx拿到的onlineNum就是res.body
        case wsConstant.WS_OP_HEARTBEAT_REPLY:
          // get()的事件处理函数是在Room.tsx中调用on方法添加的
          callback = this.eventHandle.get(Events.HEARTBEAT_REPLY);
          break;
        // 如果收到的是WS_OP_MESSAGE，res.body将是聊天数据
        case wsConstant.WS_OP_MESSAGE:
          callback = this.eventHandle.get(Events.MESSAGE_RECEIVE);
          break;
        // 如果收到的连接成功的消息，则建立定时发送心跳机制
        case wsConstant.WS_OP_CONNECT_SUCCESS:
          // 如果之前未建立建立心跳
          if (!this.heartBeatInterval) {
            // 发送第一次心跳
            const arrayBuffer =
              this.convertToArrayBuffer("", wsConstant.WS_OP_HEARTBEAT);
            this.webSocket.send(arrayBuffer);

            // 这之后每隔30秒发送一次心跳
            this.heartBeatInterval = setInterval(() => {
              const arrayBuffer =
                this.convertToArrayBuffer("", wsConstant.WS_OP_HEARTBEAT);
              this.webSocket.send(arrayBuffer);
            }, 30000);
          }
          break;
      }

      if (callback) {
        callback(res.body);
      }
    });

    this.webSocket.addEventListener("close", () => {
      clearInterval(this.heartBeatInterval);
    });

    this.webSocket.addEventListener("error", () => {
      this.webSocket.close();
    });
  }

  // 将字符串转成ArrayBuffer
  private convertToArrayBuffer(json: string, opt: number) {
    json = json || "";
    const len = wsConstant.WS_PACKAGE_HEADER_TOTAL_LENGTH + json.length;
    wsHeaderList[0].value = len; // Packet Length
    wsHeaderList[3].value = opt; // Operation

    // 将wsHeaderList中的value存入headerArrayBuffer
    const headerArrayBuffer =
      new ArrayBuffer(wsConstant.WS_PACKAGE_HEADER_TOTAL_LENGTH);
    // ArrayBuffer对象不能直接操作，而要通过TypeArray或DataView对象来操作
    const dataView = new DataView(headerArrayBuffer);
    wsHeaderList.forEach(item => {
      // 从DataView起始位置以byte为计数的指定偏移量(byteOffset)处储存一个16-bit数
      item.bytes === 2 ? dataView.setInt16(item.offset, item.value) :
        item.bytes === 4 && dataView.setInt32(item.offset, item.value);
    });

    // Uint8Array是一种TypedArray视图，用来读写简单类型的二进制数据
    // 将head、body合并放入Uint8Array
    const head = new Uint8Array(headerArrayBuffer);
    const body = new Uint8Array(this.encodeArrayBuffer(json));
    const unit8Array = new Uint8Array(head.byteLength + body.byteLength);
    unit8Array.set(head, 0);
    unit8Array.set(body, head.byteLength);

    return unit8Array.buffer;
  }
  // 将ArrayBuffer进行unicode编码
  private encodeArrayBuffer(json: string): ArrayBuffer {
    if (json) {
      const uint8Array = new Uint8Array(json.length);
      for (let i = 0; i < json.length; i++) {
        uint8Array[i] = json.charCodeAt(i);
      }
      return uint8Array.buffer;
    }
    return null;
  }

  // 将arrayBuffer转成resObj
  private convertToObject(arrayBuffer: ArrayBuffer): resObj {
    const dataView = new DataView(arrayBuffer);
    const res: resObj = { body: [] };

    // 给res的每个key赋值，值为offset
    wsHeaderList.forEach(item => {
      item.bytes === 2 ? res[item.key] = dataView.getInt16(item.offset) :
        item.bytes === 4 && (res[item.key] = dataView.getInt32(item.offset));
    });

    // 根据服务器响应类型，设置res.body
    if (res.op === wsConstant.WS_OP_HEARTBEAT_REPLY) {
      res.body = { onlineNum: dataView.getInt32(res.headerLen) };
      // 如果是聊天信息
    } else if (res.op === wsConstant.WS_OP_MESSAGE) {
      // 如果ver是压缩类型的
      if (res.ver === wsConstant.WS_BODY_PROTOCOL_VERSION_DEFLATE) {
        const bodyArrayBuffer = arrayBuffer.slice(res.headerLen);
        // 解压流内容
        const bodyUint8Array = pako.inflate(new Uint8Array(bodyArrayBuffer));
        const body = this.getBody(bodyUint8Array.buffer, []);
        res.body = body;
      } else {
        const bodyLength = dataView.byteLength - res.headerLen;
        const array = [];
        for (let i = 0; i < bodyLength; i++) {
          array.push(dataView.getUint8(res.headerLen + i));
        }
        res.body = [JSON.parse(this.decodeArrayBuffer(array))];
      }
    }

    return res;
  }
  // body由多个二进制包组成，通过递归将所有包的内容push到body中
  private getBody(arrayBuffer: ArrayBuffer, body: Array<any>) {
    const dataView = new DataView(arrayBuffer);
    const packetLen = dataView.getInt32(wsConstant.WS_PACKAGE_OFFSET);
    const headerLen = dataView.getInt16(wsConstant.WS_HEADER_OFFSET);

    body.push(JSON.parse(this.decodeArrayBuffer(arrayBuffer.slice(headerLen, packetLen))));
    // arrayBuffer.byteLength是所有信息的长度，packetLen是其中的一个包的长度
    if (packetLen < arrayBuffer.byteLength) {
      // 递归push剩余的包
      this.getBody(arrayBuffer.slice(packetLen), body);
    }

    return body;
  }
  // 将arraybuffer解码后转成字符串
  private decodeArrayBuffer(arrayBuffer: ArrayBuffer | Array<any>): string | null {
    if (arrayBuffer) {
      // decodeURIComponent可以对URI进行解码
      return decodeURIComponent(
        // escape()函数可对字符串进行编码，这样就可以在所有的计算机上读取该字符串
        window.escape(
          // fromCharCode将Unicode转成字符串
          String.fromCharCode
            // Function.apply()方法的第一个参数将代替Function里的this对象
            // 第二个参数将作为参数传给Function
            .apply(null, new Uint8Array(arrayBuffer))
        )
      );
    }
    return null;
  }
}
