/* Notice是Toast最底层组件
每个黑色的小框框其实都是一个Notice
Notice核心就是组件初始化的时候生成一个定时器
根据输入的时间加载一个动画，然后执行输入的回调
Notice的显示和隐藏受到父组件Notification的绝对控制 */

import React from 'react';
import style from '../style/notice.styl?css-modules';

class Notice extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
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
		const _this = this;

		// 关闭的时候应该先清掉倒数定时器，然后才开启过场动画
		this.clearCloseTimer();
		_this.setState({ shouldClose: true });

		// 300ms关闭动画结束后，才是真正的结束时刻，这时才调用onClose
		this.animationTimer = setTimeout(() => {
			if (this.props.onClose) { this.props.onClose(); }
			clearTimeout(_this.animationTimer);
			_this.animationTimer = null;
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
		const { type, iconName, content } = this.props;
		const { shouldClose } = this.state;
		const noticeType = shouldClose ? "shouldClose" : type;
		const iconClassName = iconName === "loading" ? style.iconWrapper + " " + style[iconName] : style.iconWrapper;

		return (
			<div className={style.noticeWrapper + " " + style[noticeType]}>
				{
					iconName ?
						<div className={iconClassName}>
							<svg className="icon" aria-hidden="true">
								<use href={`#icon-toast-${iconName}`}></use>
							</svg>
						</div> : null
				}
				<div className={style.content}>{content}</div>
			</div>
		)
	}
}

// Notice.propTypes = {
// 	duration: React.PropTypes.number.isRequired, // Notice显示时间
// 	prefixCls: React.PropTypes.string, // 前缀class
// 	type: React.PropTypes.oneOf(['info', 'success', 'warning', 'error']), // notice类型
// 	iconName: React.PropTypes.string, // icon的class
// 	content: React.PropTypes.any, // Notice显示的内容
// 	onClose: React.PropTypes.func // 显示结束回调
// };

export default Notice