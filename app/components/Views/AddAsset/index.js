import React, { PureComponent } from 'react';
import { SafeAreaView } from 'react-native';
import { colors } from '../../../styles/common';
import Routes from '../../../common/routes';
import { connect } from 'react-redux';
import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import AddCustomToken from '../../UI/AddCustomToken';
import AddCustomTokenOrApp from '../../UI/AddCustomTokenOrApp';
import SearchTokenAutocomplete from '../../UI/SearchTokenAutocomplete';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import AddCustomCollectible from '../../UI/AddCustomCollectible';
import { getNetworkNavbarOptions } from '../../UI/Navbar';
import { NetworksChainId } from '@metamask/controllers';
import styles from './styles/index';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
/**
 * PureComponent that provides ability to add assets.
 */
class AddAsset extends PureComponent {
	static navigationOptions = ({ navigation }) =>
		getNetworkNavbarOptions(
			`add_asset.${navigation.state.params.assetType === 'token' ? 'title' : 'title_nft'}`,
			true,
			navigation
		);

	state = {
		address: '',
		symbol: '',
		decimals: ''
	};

	static propTypes = {
		/**
		/* navigation object required to push new views
		*/
		navigation: PropTypes.object,
		/**
		 * Chain id
		 */
		chainId: PropTypes.string
	};

	renderTabBar() {
		return (
			<DefaultTabBar
				underlineStyle={styles.tabUnderlineStyle}
				activeTextColor={colors.blue}
				inactiveTextColor={colors.fontTertiary}
				backgroundColor={colors.transparent}
				tabStyle={styles.tabStyle}
				textStyle={styles.textStyle}
			/>
		);
	}

	render = () => {
		const {
			chainId,
			navigation: {
				state: {
					params: { assetType, collectibleContract }
				}
			},
			navigation
		} = this.props;
		return (
			<OnboardingScreenWithBg screen="a">
				<SafeAreaView style={styles.wrapper} testID={`add-${assetType}-screen`}>
					{assetType === 'token' ? (
						chainId == Routes.mainNetWork.chainId ? (
							<AddCustomTokenOrApp navigation={navigation} tabLabel={strings('add_asset.custom_token')} />
						) : (
							<ScrollableTabView renderTabBar={this.renderTabBar}>
								{NetworksChainId.mainnet === this.props.chainId && (
									<SearchTokenAutocomplete
										navigation={navigation}
										tabLabel={strings('add_asset.search_token')}
										testID={'tab-search-token'}
									/>
								)}
								<AddCustomToken
									navigation={navigation}
									tabLabel={strings('add_asset.custom_token')}
									testID={'tab-add-custom-token'}
								/>
							</ScrollableTabView>
						)
					) : (
						<AddCustomCollectible
							navigation={navigation}
							collectibleContract={collectibleContract}
							testID={'add-custom-collectible'}
						/>
					)}
				</SafeAreaView>
			</OnboardingScreenWithBg>
		);
	};
}

const mapStateToProps = state => ({
	chainId: state.engine.backgroundState.NetworkController.provider.chainId
});

export default connect(mapStateToProps)(AddAsset);
