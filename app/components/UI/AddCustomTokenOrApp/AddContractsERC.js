import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import ActionView from '../ActionView';
import AssetList from '../AssetList';
import Engine from '../../../core/Engine';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent,
		flex: 1
	}
});

/**
 * PureComponent that provides ability to add select contracts
 */
export default class AddContractsERC extends PureComponent {
	static propTypes = {
		onAddToken: PropTypes.func,
		onCancel: PropTypes.func
	};

	state = {
		selectedAsset: {}
	};

	componentDidUpdate(prevProps) {
		if (prevProps != this.props) {
			this.setState({ selectedAsset: {} });
		}
	}

	handleSelectAsset = asset => {
		this.setState({ selectedAsset: asset });
	};

	addToken = async () => {
		const { AssetsController } = Engine.context;
		const { address, symbol, decimals } = this.state.selectedAsset;
		await AssetsController.addToken(address, symbol, decimals);

		const { onAddToken } = this.props;
		if (onAddToken) onAddToken();
	};

	cancelAddToken = () => {
		const { onCancel } = this.props;
		if (onCancel) onCancel();
	};

	render = () => {
		const { contracts } = this.props;
		const { selectedAsset } = this.state;
		const { address, symbol } = selectedAsset;

		return (
			<View style={styles.wrapper}>
				<ActionView
					cancelText={strings('add_asset.tokens.cancel_add_token')}
					confirmText={strings('add_asset.tokens.add_token')}
					onCancelPress={this.cancelAddToken}
					onConfirmPress={this.addToken}
					confirmDisabled={!(address && symbol)}
				>
					<AssetList
						searchResults={contracts}
						handleSelectAsset={this.handleSelectAsset}
						selectedAsset={selectedAsset}
					/>
				</ActionView>
			</View>
		);
	};
}
