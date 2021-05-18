import React from 'react'
import ReactDOM from 'react-dom'
import Toast from './toast'
import './toast.css'

async function createNotification() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const toastDOMRef = React.createRef();
  await ReactDOM.render(<Toast ref={toastDOMRef} />, div);

  return {
    addNotice(notice) {
      return toastDOMRef.current.createNotice(notice);
    },
    destroy() {
      ReactDOM.unmountComponentAtNode(div);
      document.body.removeChild(div);
    }
  }
}

let notification
const notice = (type, content, duration = 2000, onClose) => {
  if (!notification) {
    createNotification().then(res => {
      notification = res
      return notification.addNotice({ type, content, duration, onClose })
    })
  } else {
    return notification.addNotice({ type, content, duration, onClose })
  }
}

export default {
  info(content, duration, onClose) {
    return notice('info', content, duration, onClose)
  },
  success(content = '操作成功', duration, onClose) {
    return notice('success', content, duration, onClose)
  },
  error(content, duration, onClose) {
    return notice('error', content, duration, onClose)
  },
  loading(content = '加载中...', duration = 0, onClose) {
    return notice('loading', content, duration, onClose)
  }
}