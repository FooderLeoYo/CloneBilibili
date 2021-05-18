// Notification是Notice父组件，容器
// 是动态插入和删除DOM节点的核心
// 同时也向上暴露给Toast重写改变自己的方法
import * as React from "react";
import * as ReactDOM from 'react-dom';

import Notice from '../notice/Notice';
import "./notification.scss"

// 统计notice总数 防止重复
let noticeNumber = 0;
// 生成唯一的id
const getUuid = () => "notification-" + new Date().getTime() + "-" + noticeNumber++;

interface NotificationProps {

}

interface NotificationState {
  notices: Array<Notice>;
  hasMask: boolean;
}

class Notification extends React.Component<NotificationProps, NotificationState> {
  constructor(props) {
    super(props);
    this.state = {
      notices: [], // 存储当前有的notices
      hasMask: true, // 是否需要遮盖层
    }
  }

  public add(notice) {
    const { notices } = this.state;
    const key = notice.key ? notice.key : notice.key = getUuid();
    const mask = notice.mask ? notice.mask : false;
    const temp = notices.filter(item => item.key === key).length;

    if (!temp) { // 若不存在重复的才添加
      notices.push(notice);
      this.setState({
        notices: notices,
        hasMask: mask
      });
    }
  }

  public remove(key) {
    // 根据key删除对应
    this.setState(previousState => {
      return {
        notices: previousState.notices.filter(notice => notice.key !== key),
      };
    });
  }

  // Notification增加一个重写方法
  // 该方法方便Notification组件动态添加到页面中和重写
  public reWrite(properties) {
    const { ...props } = properties || {}; // 扩展运算符是为了深拷贝properties

    const divDOM = document.createElement('div');
    document.body.appendChild(divDOM);

    const notification: any = ReactDOM.render(<Notification {...props} />, divDOM);

    return {
      createNotice(noticeProps) {
        notification.add(noticeProps);
      },
      removeNotice(key) {
        notification.remove(key);
      },
      destroy() {
        ReactDOM.unmountComponentAtNode(divDOM);
        document.body.removeChild(divDOM);
      },
      component: notification
    }
  }

  private createNoticeDOM() {
    const _this = this;
    const { notices } = this.state;
    let result = [];

    notices.map(notice => {
      // 每个Notice onClose的时候，删除掉notices中对应key的notice
      const closeCallback = () => {
        _this.remove(notice.key);
        // 如果有用户传入的onClose，则执行
        if (notice.onClose) notice.onClose();
      };
      result.push(<Notice key={notice.key} {...notice} onClose={closeCallback} />);
    });

    return result;
  }

  render() {
    const { notices, hasMask } = this.state;
    const noticeDOM = this.createNoticeDOM();

    return (
      <div className="zby-notification-box">
        {notices.length > 0 && hasMask ? <div className="zby-mask"></div> : null}
        {noticeDOM}
      </div>
    )
  }
}

export default Notification;
