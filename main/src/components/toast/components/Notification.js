// Notification是Notice父组件，容器
// 是动态插入和删除DOM节点的核心
// 同时也向上暴露给Toast重写改变自己的方法
import React from 'react';
import ReactDOM from 'react-dom';
import Notice from './Notice';
import '../style/notification.scss';

class Notification extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			noticesProps: [], // 存储当前有的notices
			hasMask: true, // 是否显示蒙版
		}
	}

	add(noticeProps) {
		// 添加notice
		// 创造一个不重复的key
		const { noticesProps } = this.state;
		const key = noticeProps.key ? noticeProps.key : noticeProps.key = getUuid();
		const mask = noticeProps.mask ? noticeProps.mask : false;
		const temp = noticesProps.filter(item => item.key === key).length;

		if (!temp) {
			// 不存在重复的 添加
			noticesProps.push(noticeProps);
			this.setState({
				noticesProps: noticesProps,
				hasMask: mask
			});
		}
	}

	remove(key) {
		// 根据key删除对应
		this.setState(previousState => ({ noticesProps: previousState.noticesProps.filter(notice => notice.key !== key) }));
	}

	createNoticeDOM() {
		const _this = this;
		const { noticesProps } = this.state;
		const result = [];

		noticesProps.map(notice => {
			// 每个Notice onClose的时候 删除掉notices中对应key的notice
			const closeCallback = () => {
				_this.remove(notice.key);
				// 如果有用户传入的onClose 执行
				if (notice.onClose) notice.onClose();
			};

			result.push(
				<Notice
					key={notice.key}
					{...notice}
					onClose={closeCallback}
				/>
			);
		});

		return result;
	}

	render() {
		const { prefixCls } = this.props;
		const { noticesProps, hasMask } = this.state;
		const noticesDOM = this.createNoticeDOM();


		return (
			<div className={prefixCls}>
				{/* notices为空的时候不显示蒙版，并保证始终只有一个蒙版 */}
				{noticesProps.length > 0 && hasMask ? <div className="zby-mask" /> : null}
				<div className={`${prefixCls}-box`}>
					{noticesDOM}
				</div>
			</div>
		)
	}
}

// 统计notice总数 防止重复
let noticeNumber = 0;
// 生成唯一的id
const getUuid = () => {
	return 'notification-' + new Date().getTime() + '-' + noticeNumber++;
}

// Notification增加一个重写方法
// 该方法方便Notification组件动态添加到页面中和重写
Notification.reWrite = async function (properties) {
	const { ...props } = properties || {};

	const div = document.createElement('div');
	document.body.appendChild(div);
	const toastDOMRef = React.createRef();
	await ReactDOM.render(<Notification ref={toastDOMRef} {...props} />, div);

	return {
		createNotice(noticeProps) { toastDOMRef.current.add(noticeProps); },
		removeNotice(key) { notification.remove(key); },
		destroy() {
			ReactDOM.unmountComponentAtNode(div);
			document.body.removeChild(div);
		},
	}
}

// Notification.propTypes = {
// 	prefixCls: React.PropTypes.string, // 组件class前缀
// };

Notification.defaultProps = {
	prefixCls: 'notification',
};

export default Notification