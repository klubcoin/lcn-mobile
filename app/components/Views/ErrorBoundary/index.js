import React, { Component } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, StyleSheet, Image, Linking, Alert } from 'react-native';
import PropTypes from 'prop-types';
import RevealPrivateCredential from '../RevealPrivateCredential';
import Logger from '../../../util/Logger';
import routes from '../../../common/routes';
import { ScrollView } from 'react-native-gesture-handler';
import Clipboard from '@react-native-community/clipboard';
import { strings } from '../../../../locales/i18n';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from './styles';
import drawables from '../../../common/drawables';

// eslint-disable-next-line import/no-commonjs
const metamaskErrorImage = drawables.logo;

const Fallback = props => (
	<SafeAreaView style={styles.container}>
		<ScrollView style={styles.content}>
			<View style={styles.header}>
				<Image source={metamaskErrorImage} style={styles.errorImage} />
				<Text style={styles.title}>{strings('error_screen.title')}</Text>
				<Text style={styles.subtitle}>{strings('error_screen.subtitle')}</Text>
			</View>
			<View style={styles.errorContainer}>
				<Text style={styles.error}>{props.errorMessage}</Text>
			</View>
			<View style={styles.header}>
				<TouchableOpacity style={styles.button} onPress={props.resetError}>
					<Text style={styles.buttonText}>
						<Icon name="refresh" size={15} />
						{'  '}
						{strings('error_screen.try_again_button')}
					</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.textContainer}>
				<Text style={styles.text}>
					<Text>{strings('error_screen.submit_ticket_1')}</Text>
				</Text>
				<View style={styles.reportTextContainer}>
					<Text style={styles.text}>
						<Icon name="mobile-phone" size={20} />
						{'  '}
						{strings('error_screen.submit_ticket_2')}
					</Text>

					<Text style={[styles.reportStep, styles.text]}>
						<Icon name="copy" size={14} />
						{'  '}
						<Text onPress={props.copyErrorToClipboard} style={styles.link}>
							{strings('error_screen.submit_ticket_3')}
						</Text>{' '}
						{strings('error_screen.submit_ticket_4')}
					</Text>

					<Text style={[styles.reportStep, styles.text]}>
						<Icon name="send-o" size={14} />
						{'  '}
						{strings('error_screen.submit_ticket_5')}{' '}
						<Text onPress={props.openTicket} style={styles.link}>
							{strings('error_screen.submit_ticket_6')}
						</Text>{' '}
						{strings('error_screen.submit_ticket_7')}
					</Text>
				</View>
				<Text style={styles.text}>
					{strings('error_screen.save_seedphrase_1')}{' '}
					<Text onPress={props.showExportSeedphrase} style={styles.link}>
						{strings('error_screen.save_seedphrase_2')}
					</Text>{' '}
					{strings('error_screen.save_seedphrase_3')}
				</Text>
			</View>
		</ScrollView>
	</SafeAreaView>
);

Fallback.propTypes = {
	errorMessage: PropTypes.string,
	resetError: PropTypes.func,
	showExportSeedphrase: PropTypes.func,
	copyErrorToClipboard: PropTypes.func,
	openTicket: PropTypes.func
};

class ErrorBoundary extends Component {
	state = { error: null };

	static propTypes = {
		children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
		view: PropTypes.string.isRequired
	};

	static getDerivedStateFromError(error) {
		return { error };
	}

	componentDidCatch(error, errorInfo) {
		Logger.error(error, { View: this.props.view, ...errorInfo });
	}

	resetError = () => {
		this.setState({ error: null });
	};

	showExportSeedphrase = () => {
		this.setState({ backupSeedphrase: true });
	};

	cancelExportSeedphrase = () => {
		this.setState({ backupSeedphrase: false });
	};

	getErrorMessage = () => `View: ${this.props.view}\n${this.state.error.toString()}`;

	copyErrorToClipboard = async () => {
		await Clipboard.setString(this.getErrorMessage());
		Alert.alert(strings('error_screen.copied_clipboard'), '', [{ text: strings('error_screen.ok') }], {
			cancelable: true
		});
	};

	openTicket = () => {
		const url = routes.mainNetWork.reportIssueUrl;
		Linking.openURL(url);
	};

	render() {
		return this.state.backupSeedphrase ? (
			<RevealPrivateCredential privateCredentialName={'seed_phrase'} cancel={this.cancelExportSeedphrase} />
		) : this.state.error ? (
			<Fallback
				errorMessage={this.getErrorMessage()}
				resetError={this.resetError}
				showExportSeedphrase={this.showExportSeedphrase}
				copyErrorToClipboard={this.copyErrorToClipboard}
				openTicket={this.openTicket}
			/>
		) : (
			this.props.children
		);
	}
}

export default ErrorBoundary;
