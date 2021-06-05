/*  Notification是Notice父组件，容器
是动态插入和删除DOM节点的核心 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Notice from './Notice';
import style from '../style/notification.styl?css-modules';

interface NotificationState {
	noticesProps: Array<any>;
	hasMask: boolean;
}

// 统计notice总数，防止重复
let noticeNumber = 0;
// 生成唯一的id
const createID = () => {
	return 'notification-' + new Date().getTime() + '-' + noticeNumber++;
}

class Notification extends React.Component<null, NotificationState> {
	private noticesWraRef: React.RefObject<HTMLDivElement>;
	constructor(props) {
		super(props);
		this.noticesWraRef = React.createRef();
		this.state = {
			noticesProps: [], // 存储当前有的notices的Props
			hasMask: false, // 是否显示蒙版
		}
	}

	public removeTarState(key) {
		// 根据key删除对应
		this.setState(previousState => ({ noticesProps: previousState.noticesProps.filter(notice => notice.key !== key) }));
	}

	private createNoticesDOM() {
		const _this = this;
		const { noticesProps } = this.state;
		const result = [];

		noticesProps.map(notice => {
			// 每个Notice onClose的时候，删除掉state中对应key的notice
			this.noticesWraRef.current.classList.remove(style.hide);
			const closeCallback = () => {
				_this.removeTarState(notice.key);
				_this.noticesWraRef.current.classList.add(style.hide);
				if (notice.onClose) notice.onClose();
			};

			result.push(<Notice key={notice.key} {...notice} onClose={closeCallback} />);
		});

		return result;
	}

	public addNewState(noticeProps) {
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

	// Notification对外暴露一个createNotification方法
	public createNotification = async function (properties?) {
		const { ...props } = properties || {}; // 扩展运算符是为了深拷贝properties

		const div = document.createElement('div');
		document.body.appendChild(div);
		const toastDOMRef = React.createRef();
		await ReactDOM.render(<Notification ref={toastDOMRef} {...props} />, div);

		return {
			createNotice(noticeProps) { (toastDOMRef.current as Notification).addNewState(noticeProps); },
			removeNotice(key) { (toastDOMRef.current as Notification).removeTarState(key); },
			destroy() {
				ReactDOM.unmountComponentAtNode(div);
				document.body.removeChild(div);
			},
		}
	}

	render() {
		const { noticesProps, hasMask } = this.state;
		const noticesDOM = this.createNoticesDOM();

		return (
			<div className={style.notificationWrapper}>
				{noticesProps.length > 0 && hasMask ? <div className={style.mask} /> : null}
				<div className={style.noticesWrapper} ref={this.noticesWraRef}>{noticesDOM}</div>
			</div>
		)
	}
}

export default Notification;
