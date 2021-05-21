/*  Notification是Notice父组件，容器
是动态插入和删除DOM节点的核心 */

import React from 'react';
import ReactDOM from 'react-dom';
import Notice from './Notice';
import style from '../style/notification.styl?css-modules';

// 统计notice总数，防止重复
let noticeNumber = 0;
// 生成唯一的id
const createID = () => {
	return 'notification-' + new Date().getTime() + '-' + noticeNumber++;
}

class Notification extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			noticesProps: [], // 存储当前有的notices的Props
			hasMask: false, // 是否显示蒙版
		}
	}

	addNewState(noticeProps) {
		const { noticesProps } = this.state;
		const needMask = noticeProps.needMask ? noticeProps.needMask : false;
		const key = noticeProps.key ? noticeProps.key : noticeProps.key = createID();
		const duplicate = noticesProps.filter(item => item.key === key);

		if (duplicate.length === 0) {
			noticesProps.push(noticeProps);
			this.setState({
				noticesProps: noticesProps,
				hasMask: needMask
			});
		}
	}

	removeTarState(key) {
		// 根据key删除对应
		this.setState(previousState => ({ noticesProps: previousState.noticesProps.filter(notice => notice.key !== key) }));
	}

	createNoticesDOM() {
		const _this = this;
		const { noticesProps } = this.state;
		const result = [];

		noticesProps.map(notice => {
			// 每个Notice onClose的时候，删除掉state中对应key的notice
			const closeCallback = () => {
				_this.removeTarState(notice.key);
				if (notice.onClose) notice.onClose();
			};

			result.push(<Notice key={notice.key} {...notice} onClose={closeCallback} />);
		});

		return result;
	}

	render() {
		const { noticesProps, hasMask } = this.state;
		const noticesDOM = this.createNoticesDOM();

		return (
			<div className={style.notificationWrapper}>
				{noticesProps.length > 0 && hasMask ? <div className={style.mask} /> : null}
				<div className={style.noticesWrapper}>{noticesDOM}</div>
			</div>
		)
	}
}

// Notification对外暴露一个createNotification方法
Notification.createNotification = async function (properties) {
	const { ...props } = properties || {}; // 扩展运算符是为了深拷贝properties

	const div = document.createElement('div');
	document.body.appendChild(div);
	const toastDOMRef = React.createRef();
	await ReactDOM.render(<Notification ref={toastDOMRef} {...props} />, div);

	return {
		createNotice(noticeProps) { toastDOMRef.current.addNewState(noticeProps); },
		removeNotice(key) { notification.removeTarState(key); },
		destroy() {
			ReactDOM.unmountComponentAtNode(div);
			document.body.removeChild(div);
		},
	}
}

export default Notification;
