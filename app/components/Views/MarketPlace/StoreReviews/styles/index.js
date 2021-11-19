import { StyleSheet } from 'react-native';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	wrapper: {
		paddingTop: 16,
		flex: 1,
		backgroundColor: '#748cfb'
	},
	titleNavBar: {
		fontSize: RFValue(15),
		fontWeight: '500',
		flex: 1,
		textAlign: 'center',
		color: colors.white
	},
	navBar: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16
	},
	navButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center'
	},
	backIcon: {
		color: colors.white
	},
	body: {
		backgroundColor: 'white',
		flex: 1
	},
	overviewContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: colors.grey050,
		paddingVertical: 16
	},
	ratingContainer: {
		marginLeft: 20
	},
	totalReview: {
		fontSize: RFValue(12),
		marginTop: 5
	},
	ratingScore: {
		fontSize: RFValue(35)
	},
	reviewsBody: {
		padding: 16
	},
	userName: {
		fontSize: RFValue(15),
		fontWeight: '600'
	},
	scoreReviewItem: {
		fontWeight: '400',
		fontSize: RFValue(13)
	},
	reviewItem: {
		paddingVertical: 16
	},
	productName: {
		fontWeight: '600',
		marginBottom: 8,
		fontSize: RFValue(12)
	},
	ratingReviewItem: {
		alignSelf: 'flex-start',
		marginVertical: 8
	},
	reviewText: {
		fontSize: RFValue(12)
	}
});

export default assignNestedObj(styles, brandStyles);
