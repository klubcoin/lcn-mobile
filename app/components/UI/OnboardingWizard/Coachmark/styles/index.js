import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	coachmark: {
		backgroundColor: colors.purple,
		borderRadius: 8,
		padding: 18
	},
	progress: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	actions: {
		flexDirection: 'column'
	},
	actionButton: {
		width: '100%',
		marginTop: 10
	},
	title: {
		...fontStyles.bold,
		color: colors.white,
		fontSize: 18,
		alignSelf: 'center'
	},
	triangle: {
		width: 0,
		height: 0,
		backgroundColor: colors.transparent,
		borderStyle: 'solid',
		borderLeftWidth: 15,
		borderRightWidth: 15,
		borderBottomWidth: 12,
		borderLeftColor: colors.transparent,
		borderRightColor: colors.transparent,
		borderBottomColor: colors.blue,
		position: 'absolute'
	},
	triangleDown: {
		width: 0,
		height: 0,
		backgroundColor: colors.transparent,
		borderStyle: 'solid',
		borderLeftWidth: 15,
		borderRightWidth: 15,
		borderTopWidth: 12,
		borderLeftColor: colors.transparent,
		borderRightColor: colors.transparent,
		borderTopColor: colors.blue,
		position: 'absolute'
	},
	progressButton: {
		width: 75,
		height: 45,
		padding: 5
	},
	leftProgessButton: {
		left: 0
	},
	rightProgessButton: {
		right: 0
	},
	topCenter: {
		marginBottom: 10,
		bottom: -2,
		alignItems: 'center'
	},
	topLeft: {
		marginBottom: 10,
		bottom: -2,
		alignItems: 'flex-start',
		marginLeft: 30
	},
	topLeftCorner: {
		marginBottom: 10,
		bottom: -2,
		alignItems: 'flex-start',
		marginLeft: 12
	},
	bottomCenter: {
		marginBottom: 10,
		top: -2,
		alignItems: 'center'
	},
	bottomLeft: {
		marginBottom: 10,
		top: -2,
		alignItems: 'flex-start',
		marginLeft: 30
	},
	circle: {
		width: 6,
		height: 6,
		borderRadius: 6 / 2,
		backgroundColor: colors.white,
		opacity: 0.4,
		margin: 3
	},
	solidCircle: {
		opacity: 1
	},
	progessContainer: {
		flexDirection: 'row',
		alignSelf: 'center'
	}
});

export default assignNestedObj(styles, brandStyles);
