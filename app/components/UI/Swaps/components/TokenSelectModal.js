import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, SafeAreaView, TouchableOpacity, View, TouchableWithoutFeedback } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import Fuse from 'fuse.js';
import { connect } from 'react-redux';

import Device from '../../../../util/Device';
import { balanceToFiat, hexToBN, renderFromTokenMinimalUnit, renderFromWei, weiToFiat } from '../../../../util/number';
import { safeToChecksumAddress } from '../../../../util/address';
import { isSwapsNativeAsset } from '../utils';
import { strings } from '../../../../../locales/i18n';
import { colors, fontStyles } from '../../../../styles/common';

import Text from '../../../Base/Text';
import ListItem from '../../../Base/ListItem';
import ModalDragger from '../../../Base/ModalDragger';
import TokenIcon from './TokenIcon';
import TrackingTextInput from '../../TrackingTextInput';

const styles = StyleSheet.create({
	modal: {
		margin: 0,
		justifyContent: 'flex-end'
	},
	modalView: {
		backgroundColor: colors.white,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10
	},
	inputWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: 30,
		marginVertical: 10,
		paddingVertical: Device.isAndroid() ? 0 : 10,
		paddingHorizontal: 5,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: colors.grey100
	},
	searchIcon: {
		marginHorizontal: 8
	},
	input: {
		...fontStyles.normal,
		flex: 1
	},
	modalTitle: {
		marginTop: Device.isIphone5() ? 10 : 15,
		marginBottom: Device.isIphone5() ? 5 : 5
	},
	resultsView: {
		height: Device.isSmallDevice() ? 200 : 280,
		marginTop: 10
	},
	resultRow: {
		borderTopWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey100
	},
	emptyList: {
		marginVertical: 10,
		marginHorizontal: 30
	}
});

const MAX_TOKENS_RESULTS = 20;

function TokenSelectModal({
	isVisible,
	dismiss,
	title,
	tokens,
	initialTokens,
	onItemPress,
	excludeAddresses = [],
	accounts,
	selectedAddress,
	currentCurrency,
	conversionRate,
	tokenExchangeRates,
	balances
}) {
	const searchInput = useRef(null);
	const list = useRef();
	const [searchString, setSearchString] = useState('');

	const filteredTokens = useMemo(() => tokens?.filter(token => !excludeAddresses.includes(token.address)), [
		tokens,
		excludeAddresses
	]);
	const filteredInitialTokens = useMemo(
		() =>
			initialTokens?.length > 0
				? initialTokens.filter(token => !excludeAddresses.includes(token.address))
				: filteredTokens,
		[excludeAddresses, filteredTokens, initialTokens]
	);
	const tokenFuse = useMemo(
		() =>
			new Fuse(filteredTokens, {
				shouldSort: true,
				threshold: 0.45,
				location: 0,
				distance: 100,
				maxPatternLength: 32,
				minMatchCharLength: 1,
				keys: ['symbol', 'address', 'name']
			}),
		[filteredTokens]
	);
	const tokenSearchResults = useMemo(
		() =>
			searchString.length > 0
				? tokenFuse.search(searchString)?.slice(0, MAX_TOKENS_RESULTS)
				: filteredInitialTokens,
		[searchString, tokenFuse, filteredInitialTokens]
	);

	const renderItem = useCallback(
		({ item }) => {
			const itemAddress = safeToChecksumAddress(item.address);

			let balance, balanceFiat;
			if (isSwapsNativeAsset(item)) {
				balance = renderFromWei(accounts[selectedAddress] && accounts[selectedAddress].balance);
				balanceFiat = weiToFiat(hexToBN(accounts[selectedAddress].balance), conversionRate, currentCurrency);
			} else {
				const exchangeRate = itemAddress in tokenExchangeRates ? tokenExchangeRates[itemAddress] : undefined;
				balance =
					itemAddress in balances ? renderFromTokenMinimalUnit(balances[itemAddress], item.decimals) : 0;
				balanceFiat = balanceToFiat(balance, conversionRate, exchangeRate, currentCurrency);
			}

			return (
				<TouchableOpacity style={styles.resultRow} onPress={() => onItemPress(item)}>
					<ListItem>
						<ListItem.Content>
							<ListItem.Icon>
								<TokenIcon medium icon={item.iconUrl} symbol={item.symbol} />
							</ListItem.Icon>
							<ListItem.Body>
								<ListItem.Title>{item.symbol}</ListItem.Title>
								{item.name && <Text>{item.name}</Text>}
							</ListItem.Body>
							<ListItem.Amounts>
								<ListItem.Amount>{balance}</ListItem.Amount>
								{balanceFiat && <ListItem.FiatAmount>{balanceFiat}</ListItem.FiatAmount>}
							</ListItem.Amounts>
						</ListItem.Content>
					</ListItem>
				</TouchableOpacity>
			);
		},
		[balances, accounts, selectedAddress, conversionRate, currentCurrency, tokenExchangeRates, onItemPress]
	);

	const handleSearchPress = () => searchInput?.current?.focus();

	const renderEmptyList = useMemo(
		() => (
			<View style={styles.emptyList}>
				<Text>{strings('swaps.no_tokens_result', { searchString })}</Text>
			</View>
		),
		[searchString]
	);

	const handleSearchTextChange = useCallback(text => {
		setSearchString(text);
		if (list.current) list.current.scrollToOffset({ animated: false, y: 0 });
	}, []);

	return (
		<Modal
			isVisible={isVisible}
			onBackdropPress={dismiss}
			onBackButtonPress={dismiss}
			onSwipeComplete={dismiss}
			swipeDirection="down"
			propagateSwipe
			avoidKeyboard
			onModalHide={() => setSearchString('')}
			style={styles.modal}
		>
			<SafeAreaView style={styles.modalView}>
				<ModalDragger />
				<Text bold centered primary style={styles.modalTitle}>
					{title}
				</Text>
				<TouchableWithoutFeedback onPress={handleSearchPress}>
					<View style={styles.inputWrapper}>
						<Icon name="ios-search" size={20} style={styles.searchIcon} />
						<TrackingTextInput
							ref={searchInput}
							style={styles.input}
							placeholder={strings('swaps.search_token')}
							placeholderTextColor={colors.grey500}
							value={searchString}
							onChangeText={handleSearchTextChange}
						/>
					</View>
				</TouchableWithoutFeedback>
				<FlatList
					ref={list}
					style={styles.resultsView}
					keyboardDismissMode="none"
					keyboardShouldPersistTaps="always"
					data={tokenSearchResults}
					renderItem={renderItem}
					keyExtractor={item => item.address}
					ListEmptyComponent={renderEmptyList}
				/>
			</SafeAreaView>
		</Modal>
	);
}

TokenSelectModal.propTypes = {
	isVisible: PropTypes.bool,
	dismiss: PropTypes.func,
	title: PropTypes.string,
	tokens: PropTypes.arrayOf(PropTypes.object),
	initialTokens: PropTypes.arrayOf(PropTypes.object),
	onItemPress: PropTypes.func,
	excludeAddresses: PropTypes.arrayOf(PropTypes.string),
	/**
	 * ETH to current currency conversion rate
	 */
	conversionRate: PropTypes.number,
	/**
	 * Map of accounts to information objects including balances
	 */
	accounts: PropTypes.object,
	/**
	 * Currency code of the currently-active currency
	 */
	currentCurrency: PropTypes.string,
	/**
	 * A string that represents the selected address
	 */
	selectedAddress: PropTypes.string,
	/**
	 * An object containing token balances for current account and network in the format address => balance
	 */
	balances: PropTypes.object,
	/**
	 * An object containing token exchange rates in the format address => exchangeRate
	 */
	tokenExchangeRates: PropTypes.object
};

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	balances: state.engine.backgroundState.TokenBalancesController.contractBalances,
	tokenExchangeRates: state.engine.backgroundState.TokenRatesController.contractExchangeRates
});

export default connect(mapStateToProps)(TokenSelectModal);
