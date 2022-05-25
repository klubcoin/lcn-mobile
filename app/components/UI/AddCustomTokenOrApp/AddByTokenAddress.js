import React, { PureComponent } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import { colors, fontStyles } from '../../../styles/common';
import Engine from '../../../core/Engine';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import { isValidAddress } from 'ethereumjs-util';
import ActionView from '../ActionView';
import { isSmartContractAddress } from '../../../util/transactions';
import TrackingTextInput from '../TrackingTextInput';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent,
		flex: 1
	},
	rowWrapper: {
		padding: 20
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 4,
		borderColor: colors.grey100,
		padding: 16,
		...fontStyles.normal
	},
	warningText: {
		marginTop: 15,
		color: colors.red,
		...fontStyles.normal
	}
});

/**
 * Copmonent that provides ability to add custom tokens.
 */
export default class AddByTokenAddress extends PureComponent {
	static propTypes = {
		onAddToken: PropTypes.func,
		onCancel: PropTypes.func
	};

	address = '';
	warningAddress = '';
	decimals = '';
	symbol = '';

	constructor(props) {
		super(props);
		makeObservable(this, {
			address: observable,
			warningAddress: observable
		});
	}

	addToken = async () => {
		if (!(await this.validateCustomToken())) return;
		const { AssetsController } = Engine.context;
		const { address, symbol, decimals } = this;
		await AssetsController.addToken(address, symbol, decimals);

		const { onAddToken } = this.props;
		if (onAddToken) onAddToken();
	};

	cancelAddToken = () => {
		const { onCancel } = this.props;
		if (onCancel) onCancel();
	};

	validateCustomToken = async () => {
		const validatedAddress = await this.validateCustomTokenAddress();
		return validatedAddress && this.decimals && this.symbol;
	};

	validateCustomTokenAddress = async () => {
		let validated = true;
		const address = this.address;
		const isValidTokenAddress = isValidAddress(address);
		const { NetworkController } = Engine.context;
		const { chainId } = NetworkController?.state?.provider || {};
		const toSmartContract = isValidTokenAddress && (await isSmartContractAddress(address, chainId));

		if (address.length === 0) {
			this.warningAddress = strings('token.address_cant_be_empty');
			validated = false;
		} else if (!isValidTokenAddress) {
			this.warningAddress = strings('token.address_must_be_valid');
			validated = false;
		} else if (!toSmartContract) {
			this.warningAddress = strings('token.address_must_be_smart_contract');
			validated = false;
		} else {
			this.warningAddress = '';
		}
		return validated;
	};

	onAddressBlur = async () => {
		const validated = await this.validateCustomTokenAddress();
		if (validated) {
			const address = this.address;
			const { AssetsContractController } = Engine.context;
			const decimals = await AssetsContractController.getTokenDecimals(address);
			const symbol = await AssetsContractController.getAssetSymbol(address);
			this.decimals = String(decimals);
			this.symbol = symbol;
		}
	};

	render() {
		return (
			<View style={styles.wrapper}>
				<ActionView
					onCancelPress={this.cancelAddToken}
					onConfirmPress={this.addToken}
					confirmDisabled={!this.address}
					confirmText={strings('action_view.confirm')}
					cancelText={strings('action_view.cancel')}
				>
					<View style={styles.rowWrapper}>
						<Text style={[fontStyles.normal, { color: colors.white }]}>
							{strings('token.token_address')}
						</Text>
						<TrackingTextInput
							style={[styles.textInput, { color: colors.white }]}
							placeholder={'0x...'}
							placeholderTextColor={colors.grey300}
							value={this.address}
							onBlur={this.onAddressBlur}
							onChangeText={e => (this.address = e)}
							testID={'input-token-address'}
							returnKeyType={'next'}
						/>
						<Text style={styles.warningText}>{this.warningAddress}</Text>
					</View>
				</ActionView>
			</View>
		);
	}
}

observer(AddByTokenAddress);
