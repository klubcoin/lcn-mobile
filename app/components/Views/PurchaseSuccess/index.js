import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, BackHandler } from 'react-native';
import Text from '../../Base/Text';
import { colors } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import StyledButton from '../../UI/StyledButton';
import { getPurchaseOrderDetailsNavbarOptions } from '../../UI/Navbar';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import Routes from 'common/routes';
import Emoji from 'react-native-emoji';

const styles = StyleSheet.create({
	scrollViewContainer: {
		flexGrow: 1,
		paddingVertical: 36
	},
	container: {
		flex: 1,
		paddingHorizontal: 12
	},
	successContainer: {
		flex: 1,
		paddingHorizontal: 12,
		alignItems: 'center'
	},
	emoji: {
		textAlign: 'center',
		fontSize: 65,
		marginBottom: 16
	},
	congratulationTitle: {
		fontSize: 30,
		fontWeight: 'bold',
		color: colors.white,
		marginBottom: 18
	},
	congratulationDecs: {
		textAlign: 'center',
		fontWeight: '400',
		fontSize: 18,
		color: colors.white,
		lineHeight: 22
	},
	partnerOnlineStores: {
		color: colors.blue,
		fontWeight: '500',
		fontSize: 18,
		textDecorationLine: 'underline'
	},
	congratulationWrapper: {
		marginTop: 42,
		flex: 1,
		textAlign: 'center'
	},
	doneButton: {
		width: '100%',
		alignItems: 'center'
	},
	done: {
		fontWeight: '700',
		color: colors.black
	}
});

const PurchaseSuccess = ({ navigation }) => {
	useEffect(() => {
		BackHandler.addEventListener('hardwareBackPress', onBack);
		return () => {
			BackHandler.removeEventListener('hardwareBackPress', onBack);
		};
	}, []);

	const onVisitPartner = () => {
		console.log('Partner');
		navigation.navigate('Partners');
	};

	const onBack = () => {
		return true;
	};

	const onDone = () => {
		navigation.navigate('ManageCoin');
	};

	const renderOrderSuccess = () => {
		return (
			<View style={styles.successContainer}>
				<Emoji name="tada" style={styles.emoji} />
				<Text style={styles.congratulationTitle}>{strings('purchase_order_details.congratulations')}</Text>
				<Text style={styles.congratulationDecs}>
					{strings('purchase_order_details.congratulations_detail_1', { symbol: Routes.klubToken.symbol })}
				</Text>
				<Text style={styles.congratulationWrapper}>
					<Text style={styles.congratulationDecs}>
						{strings('purchase_order_details.congratulations_detail_2')}
					</Text>
					<Text style={styles.partnerOnlineStores} onPress={onVisitPartner}>
						{strings('purchase_order_details.congratulations_detail_3')}
					</Text>
					<Text style={styles.congratulationDecs}>
						{strings('purchase_order_details.congratulations_detail_4', {
							symbol: Routes.klubToken.symbol
						})}
					</Text>
				</Text>
				<StyledButton
					testID={'purchase-success-done-button'}
					type={'normal'}
					containerStyle={styles.doneButton}
					onPress={onDone}
				>
					<Text style={styles.done}>{strings('purchase_order_details.done')}</Text>
				</StyledButton>
			</View>
		);
	};

	return (
		<OnboardingScreenWithBg screen="a">
			<ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContainer}>
				{renderOrderSuccess()}
			</ScrollView>
		</OnboardingScreenWithBg>
	);
};

PurchaseSuccess.navigationOptions = ({ navigation }) =>
	getPurchaseOrderDetailsNavbarOptions('purchase_order_details.successfull_purchase_order', navigation);

PurchaseSuccess.propTypes = {
	navigation: PropTypes.object
};

export default PurchaseSuccess;
