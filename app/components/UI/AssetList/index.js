import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import StyledButton from '../StyledButton';
import AssetIcon from '../AssetIcon';
import { colors, fontStyles } from '../../../styles/common';
import Text from '../../Base/Text';
import NetworkMainAssetLogo from '../NetworkMainAssetLogo';
import routes from '../../../common/routes';
import TrackingScrollView from '../TrackingScrollView';

const styles = StyleSheet.create({
	rowWrapper: {
		padding: 20
	},
	item: {
		marginBottom: 5,
		borderWidth: 2
	},
	assetListElement: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'flex-start'
	},
	text: {
		padding: 16,
		color: colors.white
	},
	normalText: {
		...fontStyles.normal,
		color: colors.white
	}
});

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
		 * Object of the currently-selected token
		 */
		selectedAsset: PropTypes.object,
		/**
		 * Search query that generated "searchResults"
		 */
		searchQuery: PropTypes.string,
		/**
		 * Search query that generated "searchResults"
		 */
		isHideLabel: PropTypes.bool
	};

	onToggleAsset = key => {
		const { searchResults, handleSelectAsset } = this.props;
		handleSelectAsset(searchResults[key]);
	};

	render = () => {
		const { searchResults = [], handleSelectAsset, selectedAsset, isHideLabel } = this.props;

		return (
			<TrackingScrollView>
				<View style={styles.rowWrapper} testID={'add-searched-token-screen'}>
					{searchResults.length > 0 && !isHideLabel ? (
						<Text style={styles.normalText} testID={'select-token-title'}>
							{strings('token.select_token')}
						</Text>
					) : null}
					{searchResults.length === 0 && this.props.searchQuery.length ? (
						<Text style={styles.normalText}>{strings('token.no_tokens_found')}</Text>
					) : null}
					{searchResults.slice(0, 6).map((_, i) => {
						const { symbol, name, address, logo } = searchResults[i] || {};
						const isSelected = selectedAsset && selectedAsset.address === address;
						return (
							<StyledButton
								type={isSelected ? 'normal' : 'transparent'}
								containerStyle={styles.item}
								onPress={() => handleSelectAsset(searchResults[i])} // eslint-disable-line
								key={i}
								testID={'searched-token-result'}
							>
								<View style={styles.assetListElement}>
									{name === routes.mainNetWork.name ? (
										<NetworkMainAssetLogo big />
									) : (
										<AssetIcon logo={logo} />
									)}
									<Text style={styles.text}>
										{name} ({symbol})
									</Text>
								</View>
							</StyledButton>
						);
					})}
				</View>
			</TrackingScrollView>
		);
	};
}
