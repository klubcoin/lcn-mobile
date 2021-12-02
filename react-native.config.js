module.exports = {
	project: {
		ios: {},
		android: {}
	},
	assets: ['./app/fonts'],
	dependencies: {
		'react-native-code-push': {
			platforms: {
				android: null, // disable Android platform, other platforms will still autolink
			},
		},
	},
};
