import { NativeModules, Platform } from 'react-native';

const isAndroid = Platform.OS === 'android';

export default {
	forbid: isAndroid ? NativeModules.PreventScreenshot.allow : () => true,
	allow: isAndroid ? NativeModules.PreventScreenshot.allow : () => true
};
