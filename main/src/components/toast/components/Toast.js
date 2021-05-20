import Notification from './Notification';

let notificationInstance;
// notice方法实际上就是集合参数，完成对Notification的改变
async function notice(type, content, needMask = false, iconName, onClose = undefined, duration = 3000) {
	if (!notificationInstance) { notificationInstance = await Notification.createNotification(); }
	notificationInstance.createNotice({
		duration,
		type,
		needMask,
		iconName,
		content,
		onClose: () => { if (onClose) onClose(); },
	});
}

export default {
	// 无动画
	show: (content, needMask, iconName, onClose, duration) => (notice(undefined, content, needMask, iconName, onClose, duration)),
	// 翻转效果
	info: (content, needMask, iconName, onClose, duration) => (notice('info', content, needMask, iconName, onClose, duration)),
	// 缩放效果
	success: (content, needMask, iconName, onClose, duration) => (notice('success', content, needMask, iconName, onClose, duration)),
	// 从下方滑入
	warning: (content, needMask, iconName, onClose, duration) => (notice('warning', content, needMask, iconName, onClose, duration)),
	// 抖动
	error: (content, needMask, iconName, onClose, duration) => (notice('error', content, needMask, iconName, onClose, duration)),
	// loading
	loading: (content) => (notice(undefined, content || '加载中...', true, 'toastLoading', undefined, 0)),
	// 销毁
	hide() {
		if (notificationInstance) {
			notificationInstance.destroy();
			notificationInstance = null;
		}
	},
}