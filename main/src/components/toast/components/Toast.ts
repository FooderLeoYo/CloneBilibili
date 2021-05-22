import Notification from './Notification';

interface NotificationIns {
	createNotice: (noticeProps) => void;
	removeNotice: (key) => void;
	destroy: () => void;
}

let notificationInstance: NotificationIns;
// notice方法实际上就是集合参数，完成对Notification的改变
async function notice(type: string, content: string, needMask: boolean = false,
	iconName: string, onClose: Function = undefined, duration: number = 3000) {
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
	// 翻转效果
	info: (content: string, needMask: boolean, onClose: Function, duration: number) =>
		(notice('info', content, needMask, "toast-info", onClose, duration)),
	// 缩放效果
	success: (content: string, needMask: boolean, onClose: Function, duration: number) =>
		(notice('success', content, needMask, "toast-success", onClose, duration)),
	// 从下方滑入
	warning: (content: string, needMask: boolean, onClose: Function, duration: number) =>
		(notice('warning', content, needMask, "toast-warning", onClose, duration)),
	// 抖动
	error: (content: string, needMask: boolean, onClose: Function, duration: number) =>
		(notice('error', content, needMask, "close", onClose, duration)),
	// loading
	loading: (content: string = '加载中...') => (notice(undefined, content, true, 'loading', undefined, 0)),
	// 无动画
	noAni: (content: string, needMask: boolean, iconName: string, onClose: Function, duration: number) =>
		(notice(undefined, content, needMask, iconName, onClose, duration)),
	// 销毁
	hide() {
		if (notificationInstance) {
			notificationInstance.destroy();
			notificationInstance = null;
		}
	},
}