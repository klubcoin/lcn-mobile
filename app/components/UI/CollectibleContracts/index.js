import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, StyleSheet, View, InteractionManager, Image } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, fontStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import CollectibleContractElement from '../CollectibleContractElement';
import Analytics from '../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import CollectibleModal from '../CollectibleModal';
import { favoritesCollectiblesObjectSelector } from '../../../reducers/collectibles';
import Text from '../../Base/Text';
import AppConstants from '../../../core/AppConstants';
import { toLowerCaseCompare } from '../../../util/general';
import styles from './styles/index';
import { testID } from '../../../util/Logger';

/**
 * View that renders a list of CollectibleContract
 * also known as ERC-721 Tokens
 */
const CollectibleContracts = ({ collectibleContracts, collectibles, navigation, favoriteCollectibles }) => {
	const [collectible, setCollectible] = useState(null);
	const [contractName, setContractName] = useState(null);
	const [showCollectibleModal, setShowCollectibleModal] = useState(null);
	const onItemPress = useCallback((collectible, contractName) => {
		setCollectible(collectible);
		setContractName(contractName);
		setShowCollectibleModal(true);
	}, []);
	const hideCollectibleModal = () => {
		setShowCollectibleModal(false);
	};

	const goToAddCollectible = () => {
		navigation.navigate('ComingSoon');
		return;
		navigation.push('AddAsset', { assetType: 'collectible' });
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_ADD_COLLECTIBLES);
		});
	};

	const renderFooter = () => (
		<View style={styles.footer} key={'collectible-contracts-footer'}>
			<TouchableOpacity
				style={styles.add}
				onPress={goToAddCollectible}
				{...testID('collectible-contracts.component-add-collectibles')}
			>
				<Icon name="plus" size={16} color={colors.blue} />
				<Text style={styles.addText}>{strings('wallet.add_collectibles')}</Text>
			</TouchableOpacity>
		</View>
	);

	const renderCollectibleContract = useCallback(
		(item, index) => {
			const contractCollectibles = collectibles?.filter(collectible =>
				toLowerCaseCompare(collectible.address, item.address)
			);
			return (
				<CollectibleContractElement
					onPress={onItemPress}
					asset={item}
					key={item.address}
					testID={item.address}
					contractCollectibles={contractCollectibles}
					collectiblesVisible={index === 0}
				/>
			);
		},
		[collectibles, onItemPress]
	);

	const renderFavoriteCollectibles = useCallback(() => {
		const filteredCollectibles = favoriteCollectibles.map(collectible =>
			collectibles.find(
				({ tokenId, address }) => collectible.tokenId === tokenId && collectible.address === address
			)
		);
		return (
			Boolean(filteredCollectibles.length) && (
				<CollectibleContractElement
					onPress={onItemPress}
					asset={{ name: 'Favorites', favorites: true }}
					key={'Favorites'}
					contractCollectibles={filteredCollectibles}
					collectiblesVisible
				/>
			)
		);
	}, [favoriteCollectibles, collectibles, onItemPress]);

	const renderList = useCallback(
		() => (
			<View>
				{renderFavoriteCollectibles()}
				<View>{collectibleContracts?.map((item, index) => renderCollectibleContract(item, index))}</View>
			</View>
		),
		[collectibleContracts, renderFavoriteCollectibles, renderCollectibleContract]
	);

	const goToLearnMore = () => {
		navigation.navigate('ComingSoon');
		// navigation.navigate('SimpleWebview', { url: AppConstants.URLS.NFT });
	};

	const renderEmpty = () => (
		<View style={styles.emptyView}>
			<View style={styles.emptyContainer}>
				<Image
					style={styles.emptyImageContainer}
					source={require('../../../images/no-nfts-placeholder.png')}
					resizeMode={'contain'}
				/>
				<Text center style={styles.emptyTitleText} bold>
					{strings('wallet.no_nfts_yet')}
				</Text>
				<TouchableOpacity activeOpacity={0.7} {...testID('collectible-contracts-learn-more-button')}>
					<Text center big link onPress={goToLearnMore}>
						{strings('wallet.learn_more')}
					</Text>
				</TouchableOpacity>
			</View>
			<Text big style={styles.emptyText}>
				{strings('wallet.no_collectibles')}
			</Text>
		</View>
	);

	return (
		<View style={styles.wrapper} testID={'collectible-contracts'}>
			{collectibles.length ? renderList() : renderEmpty()}
			{renderFooter()}
			{collectible && contractName && (
				<CollectibleModal
					visible={showCollectibleModal}
					collectible={collectible}
					contractName={contractName}
					onHide={hideCollectibleModal}
					navigation={navigation}
				/>
			)}
		</View>
	);
};

CollectibleContracts.propTypes = {
	/**
	 * Array of collectibleContract objects
	 */
	collectibleContracts: PropTypes.array,
	/**
	 * Array of collectibles objects
	 */
	collectibles: PropTypes.array,
	/**
	 * Navigation object required to push
	 * the Asset detail view
	 */
	navigation: PropTypes.object,
	/**
	 * Object of collectibles
	 */
	favoriteCollectibles: PropTypes.array
};

const mapStateToProps = state => ({
	collectibleContracts: state.engine.backgroundState.AssetsController.collectibleContracts,
	collectibles: state.engine.backgroundState.AssetsController.collectibles,
	favoriteCollectibles: favoritesCollectiblesObjectSelector(state)
});

export default connect(mapStateToProps)(CollectibleContracts);
