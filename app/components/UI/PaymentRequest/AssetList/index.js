import React, { PureComponent } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import StyledButton from '../../StyledButton';
import AssetIcon from '../../AssetIcon';
import { colors, fontStyles } from '../../../../styles/common';
import Identicon from '../../Identicon';
import NetworkMainAssetLogo from '../../NetworkMainAssetLogo';
import styles from './styles/index';
import { TouchableOpacity } from 'react-native-gesture-handler';

/**
 * PureComponent that provides ability to search assets.
 */
export default class AssetList extends PureComponent {
	static propTypes = {
		/**
		 * Array of assets objects returned from the search
		 */
		searchResults: PropTypes.array,
		/**
		 * Callback triggered when a token is selected
		 */
		handleSelectAsset: PropTypes.func,
		/**
		 * Message string to display when searchResults is empty
		 */
		emptyMessage: PropTypes.string
	};

	/**
	 * Render logo according to asset. Could be ETH, Identicon or contractMap logo
	 *
	 * @param {object} asset - Asset to generate the logo to render
	 */
	renderLogo = asset => {
		const { logo, address, isETH } = asset;
		if (!logo && !isETH) {
			return <Identicon address={address} />;
		} else if (isETH) {
			return <NetworkMainAssetLogo big style={styles.ethLogo} />;
		}
		return <AssetIcon logo={logo} />;
	};

	render = () => {
		const { searchResults, handleSelectAsset } = this.props;

		return (
			<View style={styles.rowWrapper} testID={'add-searched-token-screen'}>
				{searchResults.slice(0, 6).map((_, i) => {
					const { symbol, name } = searchResults[i] || {};

					return (
						<TouchableOpacity
							style={styles.item}
							onPress={() => handleSelectAsset(searchResults[i])} // eslint-disable-line
							key={i}
							activeOpacity={0.7}
						>
							<View style={styles.assetListElement}>
								<View style={styles.assetIcon}>{this.renderLogo(searchResults[i])}</View>
								<View style={styles.assetInfo}>
									<Text style={styles.textSymbol}>{symbol}</Text>
									{!!name && <Text style={styles.text}>{name}</Text>}
								</View>
							</View>
						</TouchableOpacity>
					);
				})}
				{searchResults.length === 0 && <Text style={styles.text}>{this.props.emptyMessage}</Text>}
			</View>
		);
	};
}
