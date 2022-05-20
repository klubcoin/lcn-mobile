'use strict';
import React, { useEffect } from 'react';
import { SafeAreaView, Image, View, StyleSheet, BackHandler } from 'react-native';
import Text from '../../Base/Text';
import NetInfo from '@react-native-community/netinfo';
import { baseStyles, colors, fontStyles } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import StyledButton from '../../UI/StyledButton';
import { getOfflineModalNavbar } from '../../UI/Navbar';
import AndroidBackHandler from '../AndroidBackHandler';
import Device from '../../../util/Device';
import AppConstants from '../../../core/AppConstants';
import { connect } from 'react-redux';
import { getInfuraBlockedSelector } from '../../../reducers/infuraAvailability';

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	frame: {
		width: 200,
		height: 200,
		alignSelf: 'center',
		marginTop: 60
	},
	content: {
		flex: 1,
		marginHorizontal: 18,
		justifyContent: 'center',
		marginVertical: 30
	},
	title: {
		fontSize: 18,
		color: colors.fontPrimary,
		marginBottom: 10,
		...fontStyles.bold
	},
	text: {
		fontSize: 12,
		color: colors.fontPrimary,
		...fontStyles.normal
	},
	buttonContainer: {
		marginHorizontal: 18
	}
});

const astronautImage = require('../../../images/astronaut.png'); // eslint-disable-line import/no-commonjs

const OfflineMode = ({ navigation, infuraBlocked }) => {
	const netinfo = NetInfo.useNetInfo();

	const tryAgain = () => {
		if (netinfo?.isConnected) {
			navigation.pop();
		}
	};

	const learnMore = () => {
		navigation.navigate('SimpleWebview', { url: AppConstants.URLS.CONNECTIVITY_ISSUES });
	};

	useEffect(() => {
		BackHandler.addEventListener('hardwareBackPress', onBack);
		return () => {
			BackHandler.removeEventListener('hardwareBackPress', onBack);
		};
	}, []);

	const onBack = () => {
		return true;
	};

	const action = () => {
		if (infuraBlocked) {
			learnMore();
		} else {
			tryAgain();
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<Image source={astronautImage} style={styles.frame} />
			<View style={styles.content}>
				<View style={baseStyles.flexGrow}>
					<Text bold centered style={styles.title}>
						{strings('offline_mode.title')}
					</Text>
					<Text centered style={styles.text}>
						{strings(`offline_mode.text`)}
					</Text>
				</View>
				<View style={styles.buttonContainer}>
					<StyledButton testID={'offline-mode-try-again-button'} type={'blue'} onPress={action}>
						{strings(`offline_mode.${infuraBlocked ? 'learn_more' : 'try_again'}`)}
					</StyledButton>
				</View>
			</View>
			{Device.isAndroid() && <AndroidBackHandler customBackPress={tryAgain} />}
		</SafeAreaView>
	);
};

OfflineMode.navigationOptions = ({ navigation }) => getOfflineModalNavbar(navigation);

OfflineMode.propTypes = {
	/**
	 * Object that represents the navigator
	 */
	navigation: PropTypes.object,
	/**
	 * Whether infura was blocked or not
	 */
	infuraBlocked: PropTypes.bool
};

const mapStateToProps = state => ({
	infuraBlocked: getInfuraBlockedSelector(state)
});

export default connect(mapStateToProps)(OfflineMode);
