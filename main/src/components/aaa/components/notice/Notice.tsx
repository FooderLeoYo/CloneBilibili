// Notice是Toast最底层组件
// 每个黑色的小框框其实都是一个Notice
// Notice核心就是组件初始化的时候 生成一个定时器
// 根据输入的时间 加载一个动画 然后执行输入的回调
// Notice的显示和隐藏收到父组件Notification的绝对控制
import * as React from 'react';
import './notice.scss';

enum type { 'info', 'success', 'warning', 'error' }

interface NoticeProps {
	duration?: number; // Notice显示时间
	prefixCls?: string; // 前缀class
	onClose?: Function; // 显示结束回调
	shouldClose?: boolean;
	type?: type; // notice类型
	iconClass?: string; // icon的class
	content?: any; // Notice显示的内容
}

interface NoticeStates {
	duration: number; // Notice显示时间
	prefixCls: string; // 前缀class
	onClose: Function; // 显示结束回调
	shouldClose: boolean;
}

function empty() { }

class Notice extends React.Component<NoticeProps, NoticeStates> {
	private closeTimer: number;
	private timer: number;
	public key: string;
	public onClose: Function
	constructor(props) {
		super(props);
		this.state = {
			duration: 3000,
			prefixCls: 'zby-notice',
			onClose: empty,
			shouldClose: false, // 是否开启关闭动画
		}
	}

	clearCloseTimer() {
		if (this.closeTimer) {
			clearTimeout(this.closeTimer);
			this.closeTimer = null;
		}
	}

	close() {
		// 关闭的时候 应该先清掉倒数定时器
		// 然后开启过场动画
		// 等待动画结束 执行回调
		this.clearCloseTimer();
		const _this = this;
		_this.setState({ shouldClose: true });
		this.timer = setTimeout(() => {
			if (this.props.onClose) {
				this.props.onClose();
			}
			clearTimeout(_this.timer);
		}, 300);
	}

	componentDidMount() {
		if (this.props.duration > 0) {
			this.closeTimer = setTimeout(() => {
				this.close();
			}, this.props.duration - 300); // 减掉消失动画300毫秒
		}
	}

	componentWillUnmount() {
		// 当有意外关闭的时候 清掉定时器
		this.clearCloseTimer();
	}


	render() {
		const { shouldClose } = this.state;
		const { prefixCls, type, iconClass, content } = this.props;

		return (
			<div
			// className={classNames([prefixCls,
			// 	{ 'info': type === 'info' },
			// 	{ 'success': type === 'success' },
			// 	{ 'warning': type === 'warning' },
			// 	{ 'error': type === 'error' },
			// 	{ 'leave': shouldClose }
			// ])}
			>
				{iconClass ? <div className={`${prefixCls}-icon`}>
					<span
					// className={classNames(['fa', iconClass])} 
					/>
				</div> : null}
				<div className={`${prefixCls}-content`}>{content}</div>
			</div>
		)
	}
}

export default Notice;
