import React, { PureComponent } from 'react';
import { Text, View, StyleSheet, InteractionManager } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import Engine from '../../../core/Engine';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import { isValidAddress } from 'ethereumjs-util';
import ActionView from '../ActionView';
import { isSmartContractAddress } from '../../../util/transactions';
import AnalyticsV2 from '../../../util/analyticsV2';
import styles from './styles/index';
import TrackingTextInput from '../TrackingTextInput';
import { testID } from '../../../util/Logger';

/**
 * Copmonent that provides ability to add custom tokens.
 */
export default class AddCustomToken extends PureComponent {
	state = {
		address: '',
		symbol: '',
		decimals: '',
		warningAddress: '',
		warningSymbol: '',
		warningDecimals: ''
	};

	static propTypes = {
		/**
		/* navigation object required to push new views
		*/
		navigation: PropTypes.object
	};

	getAnalyticsParams = () => {
		try {
			const { NetworkController } = Engine.context;
			const { chainId, type } = NetworkController?.state?.provider || {};
			const { address, symbol } = this.state;
			return {
				token_address: address,
				token_symbol: symbol,
				network_name: type,
				chain_id: chainId,
				source: 'Custom token'
			};
		} catch (error) {
			return {};
		}
	};

	addToken = async () => {
		if (!(await this.validateCustomToken())) return;
		const { AssetsController } = Engine.context;
		const { address, symbol, decimals } = this.state;
		await AssetsController.addToken(address, symbol, decimals);

		AnalyticsV2.trackEvent(AnalyticsV2.ANALYTICS_EVENTS.TOKEN_ADDED, this.getAnalyticsParams());

		// Clear state before closing
		this.setState(
			{
				address: '',
				symbol: '',
				decimals: '',
				warningAddress: '',
				warningSymbol: '',
				warningDecimals: ''
			},
			() => {
				InteractionManager.runAfterInteractions(() => {
					this.props.navigation.goBack();
				});
			}
		);
	};

	cancelAddToken = () => {
		this.props.navigation.goBack();
	};

	onAddressChange = address => {
		this.setState({ address });
	};

	onSymbolChange = symbol => {
		this.setState({ symbol });
	};

	onDecimalsChange = decimals => {
		this.setState({ decimals });
	};

	onAddressBlur = async () => {
		const validated = await this.validateCustomTokenAddress();
		if (validated) {
			const address = this.state.address;
			const { AssetsContractController } = Engine.context;
			const decimals = await AssetsContractController.getTokenDecimals(address);
			const symbol = await AssetsContractController.getAssetSymbol(address);
			this.setState({ decimals: String(decimals), symbol });
		}
	};

	validateCustomTokenAddress = async () => {
		let validated = true;
		const address = this.state.address;
		const isValidTokenAddress = isValidAddress(address);
		const { NetworkController } = Engine.context;
		const { chainId } = NetworkController?.state?.provider || {};
		const toSmartContract = isValidTokenAddress && (await isSmartContractAddress(address, chainId));
		if (address.length === 0) {
			this.setState({ warningAddress: strings('token.address_cant_be_empty') });
			validated = false;
		} else if (!isValidTokenAddress) {
			this.setState({ warningAddress: strings('token.address_must_be_valid') });
			validated = false;
		} else if (!toSmartContract) {
			this.setState({ warningAddress: strings('token.address_must_be_smart_contract') });
			validated = false;
		} else {
			this.setState({ warningAddress: `` });
		}
		return validated;
	};

	validateCustomTokenSymbol = () => {
		let validated = true;
		const symbol = this.state.symbol;
		if (symbol.length === 0) {
			this.setState({ warningSymbol: strings('token.symbol_cant_be_empty') });
			validated = false;
		} else {
			this.setState({ warningSymbol: `` });
		}
		return validated;
	};

	validateCustomTokenDecimals = () => {
		let validated = true;
		const decimals = this.state.decimals;
		if (decimals.length === 0) {
			this.setState({ warningDecimals: strings('token.decimals_cant_be_empty') });
			validated = false;
		} else {
			this.setState({ warningDecimals: `` });
		}
		return validated;
	};

	validateCustomToken = async () => {
		const validatedAddress = await this.validateCustomTokenAddress();
		const validatedSymbol = this.validateCustomTokenSymbol();
		const validatedDecimals = this.validateCustomTokenDecimals();
		return validatedAddress && validatedSymbol && validatedDecimals;
	};

	assetSymbolInput = React.createRef();
	assetPrecisionInput = React.createRef();

	jumpToAssetSymbol = () => {
		const { current } = this.assetSymbolInput;
		current && current.focus();
	};

	jumpToAssetPrecision = () => {
		const { current } = this.assetPrecisionInput;
		current && current.focus();
	};

	render = () => {
		const { address, symbol, decimals } = this.state;
		return (
			<View style={styles.wrapper} testID={'add-custom-token-screen'}>
				<ActionView
					cancelTestID={'add-custom-asset-cancel-button'}
					confirmTestID={'add-custom-asset-confirm-button'}
					cancelText={strings('add_asset.tokens.cancel_add_token')}
					confirmText={strings('add_asset.tokens.add_token')}
					onCancelPress={this.cancelAddToken}
					testID={'add-asset-cancel-button'}
					onConfirmPress={this.addToken}
					confirmDisabled={!(address && symbol && decimals)}
				>
					<View>
						<View style={styles.rowWrapper}>
							<Text style={styles.tokenAddress}>{strings('token.token_address')}</Text>
							<TrackingTextInput
								{...testID('add-custom-token-address-field')}
								style={styles.textInput}
								placeholder={'0x...'}
								placeholderTextColor={colors.grey100}
								value={this.state.address}
								onChangeText={this.onAddressChange}
								onBlur={this.onAddressBlur}
								onSubmitEditing={this.jumpToAssetSymbol}
								returnKeyType={'next'}
							/>
							<Text style={styles.warningText} testID={'token-address-warning'}>
								{this.state.warningAddress}
							</Text>
						</View>
						<View style={styles.rowWrapper}>
							<Text style={styles.tokenAddress}>{strings('token.token_symbol')}</Text>
							<TrackingTextInput
								{...testID('add-custom-token-symbol-field')}
								style={styles.textInput}
								placeholder={'GNO'}
								placeholderTextColor={colors.grey100}
								value={this.state.symbol}
								onChangeText={this.onSymbolChange}
								onBlur={this.validateCustomTokenSymbol}
								ref={this.assetSymbolInput}
								onSubmitEditing={this.jumpToAssetPrecision}
								returnKeyType={'next'}
							/>
							<Text style={styles.warningText}>{this.state.warningSymbol}</Text>
						</View>
						<View style={styles.rowWrapper}>
							<Text style={styles.tokenAddress}>{strings('token.token_precision')}</Text>
							<TrackingTextInput
								{...testID('add-custom-token-custom-token-decimal-field')}
								style={styles.textInput}
								value={this.state.decimals}
								keyboardType="numeric"
								maxLength={2}
								placeholder={'18'}
								placeholderTextColor={colors.grey100}
								onChangeText={this.onDecimalsChange}
								onBlur={this.validateCustomTokenDecimals}
								ref={this.assetPrecisionInput}
								onSubmitEditing={this.addToken}
								returnKeyType={'done'}
							/>
							<Text style={styles.warningText} testID={'token-decimals-warning'}>
								{this.state.warningDecimals}
							</Text>
						</View>
					</View>
				</ActionView>
			</View>
		);
	};
}
