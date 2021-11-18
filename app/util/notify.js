import Toast from 'react-native-toast-message';
import { strings } from '../../locales/i18n';

export function showSuccess(message) {
	Toast.show({
		type: 'success',
		text1: message,
		text2: strings('profile.notice'),
		visibilityTime: 1000
	});
}

export function showError(message) {
	Toast.show({
		type: 'error',
		text1: message,
		text2: strings('profile.notice'),
		visibilityTime: 1000
	});
}

export function showInfo(message) {
	Toast.show({
		type: 'info',
		text1: message,
		text2: strings('profile.notice'),
		visibilityTime: 1000
	});
}
