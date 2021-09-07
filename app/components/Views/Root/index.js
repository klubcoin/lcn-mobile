import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';

import { ReactNativeKeycloakProvider } from '@react-keycloak/native';
import keycloak from '../../../../keycloak';

import { store, persistor } from '../../../store/';
import SplashScreen from 'react-native-splash-screen';

import App from '../../Nav/App';
import SecureKeychain from '../../../core/SecureKeychain';
import EntryScriptWeb3 from '../../../core/EntryScriptWeb3';
import Logger from '../../../util/Logger';
import ErrorBoundary from '../ErrorBoundary';
import { Provider as ProviderMobX } from 'mobx-react'
import preferences from '../../../../app/store/preferences'

preferences.load();
/**
 * Top level of the component hierarchy
 * App component is wrapped by the provider from react-redux
 */
export default class Root extends PureComponent {
	static propTypes = {
		foxCode: PropTypes.string
	};

	static defaultProps = {
		foxCode: 'null'
	};

	errorHandler = (error, stackTrace) => {
		Logger.error(error, stackTrace);
	};

	constructor(props) {
		super(props);
		SecureKeychain.init(props.foxCode);
		// Init EntryScriptWeb3 asynchronously on the background
		EntryScriptWeb3.init();
		SplashScreen.hide();
	}

	render = () => (
		<ReactNativeKeycloakProvider
			authClient={keycloak}
			initOptions={{
				redirectUri: 'liquichain://auth',
				inAppBrowserOptions: {},
				onEvent: (event, error) => {
					console.log('keycloak onEvent', event, error);
				},
				onTokens: (tokens) => {
					console.log('keycloak onTokens', tokens);
				},
			}}
		>
			<Provider store={store}>
				<ProviderMobX store={preferences}>
					<PersistGate persistor={persistor}>
						<ErrorBoundary onError={this.errorHandler} view="Root">
							<App />
						</ErrorBoundary>
					</PersistGate>
				</ProviderMobX>
			</Provider>
		</ReactNativeKeycloakProvider>
	);
}
