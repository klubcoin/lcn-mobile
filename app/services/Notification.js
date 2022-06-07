import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
class Notifications {
	constructor(onPressNotification) {
		PushNotification.configure({
			onRegister: function(token) {
				console.log('TOKEN:', token);
			},
			onNotification: function(notification) {
				console.log('NOTIFICATION', notification);
				onPressNotification && onPressNotification(notification.data.address);
			},
			onAction: function(notification) {
				console.log('ACTION:', notification.action);
				console.log('NOTIFICATION:', notification);

				// process the action
			},
			permissions: {
				alert: true,
				badge: true,
				sound: true
			},
			popInitialNotification: true,
			requestPermissions: Platform.OS === 'ios'
		});

		PushNotification.createChannel(
			{
				channelId: 'reminders',
				channelName: 'Task reminder notifications',
				channelDescription: 'Reminder for any tasks'
			},
			() => {}
		);
		PushNotification.getScheduledLocalNotifications(rn => {
			console.log('SN --- ', rn);
		});
	}

	showNotification(title = '', message = '', address = '') {
		console.log('trying send notification');
		PushNotification.localNotification({
			channelId: 'reminders',
			title,
			message,
			invokeApp: true,
			userInfo: { title, message, address }
		});
	}
}

export default Notifications;
