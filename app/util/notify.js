import { NoticeType } from '../components/UI/NotifPopup';

export function showSuccess(message, options) {
	const { duration, onPress } = options || {};
	notifRef().show({
		onPress,
		title: NoticeType.success,
		body: message,
		slideOutTime: duration || 1000,
	});
}

export function showError(message, options) {
	const { duration, onPress } = options || {};
	notifRef().show({
		onPress,
		title: NoticeType.error,
		body: message,
		slideOutTime: duration || 1000,
	});
}

export function showInfo(message, options) {
	const { type, duration, onPress } = options || {};
	notifRef().show({
		onPress,
		title: type || NoticeType.info,
		body: message,
		slideOutTime: duration || 1000,
	});
}

const notifPopupState = { state: null };
export const setNotifRef = (e) => notifPopupState.state = e;
export const notifRef = () => notifPopupState.state;