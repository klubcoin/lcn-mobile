import React, { PureComponent } from 'react';
import Engine from '../../../core/Engine';
import PropTypes from 'prop-types';
import {
	Alert,
	ActivityIndicator,
	InteractionManager,
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	DeviceEventEmitter
} from 'react-native';
import * as RNFS from 'react-native-fs';
import { colors, fontStyles } from '../../../styles/common';
import Device from '../../../util/Device';
import { strings } from '../../../../locales/i18n';
import { toChecksumAddress } from 'ethereumjs-util';
import Logger from '../../../util/Logger';
import Analytics from '../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import AccountElement from './AccountElement';
import { connect } from 'react-redux';
import API from 'services/api';
import Routes from 'common/routes';
import * as sha3JS from 'js-sha3';
import preferences from '../../../store/preferences';
import { refWebRTC } from '../../../services/WebRTC';
import FileTransferWebRTC from '../../Views/FilesManager/store/FileTransferWebRTC';
import { RestoreSecretRequest } from '../../../services/Messages';
import styles from './styles/index';
import StyledButton from '../StyledButton';
import NetInfo from '@react-native-community/netinfo';
import { showError } from '../../../util/notify';

/**
 * View that contains the list of all the available accounts
 */
console.log(styles);

class AccountList extends PureComponent {
	static propTypes = {
		/**
		 * Map of accounts to information objects including balances
		 */
		accounts: PropTypes.object,
		network: PropTypes.string,
		/**
		 * An object containing each identity in the format address => account
		 */
		identities: PropTypes.object,
		/**
		 * A string representing the selected address => account
		 */
		selectedAddress: PropTypes.string,
		/**
		 * An object containing all the keyrings
		 */
		keyrings: PropTypes.array,
		/**
		 * function to be called when switching accounts
		 */
		onAccountChange: PropTypes.func,
		/**
		 * function to be called when importing an account
		 */
		onImportAccount: PropTypes.func,
		/**
		 * Current provider ticker
		 */
		ticker: PropTypes.string,
		/**
		 * Whether it will show options to create or import accounts
		 */
		enableAccountsAddition: PropTypes.bool,
		/**
		 * function to generate an error string based on a passed balance
		 */
		getBalanceError: PropTypes.func,
		/**
		 * Indicates whether third party API mode is enabled
		 */
		thirdPartyApiMode: PropTypes.bool
	};

	state = {
		selectedAccountIndex: 0,
		loading: false,
		orderedAccounts: {}
	};

	flatList = React.createRef();
	lastPosition = 0;
	updating = false;

	getInitialSelectedAccountIndex = () => {
		const { identities, selectedAddress } = this.props;
		Object.keys(identities).forEach((address, i) => {
			if (selectedAddress === address) {
				this.mounted && this.setState({ selectedAccountIndex: i });
			}
		});
	};

	componentDidMount() {
		this.mounted = true;
		this.getInitialSelectedAccountIndex();
		const orderedAccounts = this.getAccounts();
		InteractionManager.runAfterInteractions(() => {
			if (orderedAccounts.length > 4) {
				this.scrollToCurrentAccount();
			}
		});
		this.mounted && this.setState({ orderedAccounts });
		this.createAccountDuringRegistration(orderedAccounts);
	}

	createAccountDuringRegistration(orderedAccounts) {
		console.log('accounts', orderedAccounts);
	}

	componentWillUnmount = () => {
		this.mounted = false;
	};

	scrollToCurrentAccount() {
		// eslint-disable-next-line no-unused-expressions
		this.flatList?.current?.scrollToIndex({ index: this.state.selectedAccountIndex, animated: true });
	}

	onAccountChange = async newIndex => {
		const previousIndex = this.state.selectedAccountIndex;
		const { PreferencesController } = Engine.context;
		const { keyrings } = this.props;

		requestAnimationFrame(async () => {
			try {
				this.mounted && this.setState({ selectedAccountIndex: newIndex });

				const allKeyrings =
					keyrings && keyrings.length ? keyrings : Engine.context.KeyringController.state.keyrings;
				const accountsOrdered = allKeyrings.reduce((list, keyring) => list.concat(keyring.accounts), []);

				// If not enabled is used from address book so we don't change accounts
				if (!this.props.enableAccountsAddition) {
					this.props.onAccountChange(accountsOrdered[newIndex]);
					const orderedAccounts = this.getAccounts();
					this.mounted && this.setState({ orderedAccounts });
					return;
				}

				PreferencesController.setSelectedAddress(accountsOrdered[newIndex]);

				this.props.onAccountChange();

				this.props.thirdPartyApiMode &&
					InteractionManager.runAfterInteractions(async () => {
						setTimeout(() => {
							Engine.refreshTransactionHistory();
						}, 1000);
					});
			} catch (e) {
				// Restore to the previous index in case anything goes wrong
				this.mounted && this.setState({ selectedAccountIndex: previousIndex });
				Logger.error(e, 'error while trying change the selected account'); // eslint-disable-line
			}
			InteractionManager.runAfterInteractions(() => {
				setTimeout(() => {
					Analytics.trackEvent(ANALYTICS_EVENT_OPTS.ACCOUNTS_SWITCHED_ACCOUNTS);
				}, 1000);
			});
			const orderedAccounts = this.getAccounts();
			this.mounted && this.setState({ orderedAccounts });
		});
	};

	importAccount = () => {
		this.props.onImportAccount();
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.ACCOUNTS_IMPORTED_NEW_ACCOUNT);
		});
	};

	restoreAccountFromFriends = () => {
		this.props.navigation.navigate('Contacts', {
			contactSelection: true,
			onConfirm: this.sendProfileToClaimIdentity
		});
	};

	sendProfileToClaimIdentity = async contacts => {
		const webrtc = refWebRTC();
		const { selectedAddress } = this.props;
		const addresses = contacts.map(e => e.address);

		const { avatar, firstname, lastname } = this.props.onboardProfile || {};
		const image = await RNFS.readFile(avatar, 'base64');

		const request = RestoreSecretRequest(selectedAddress, firstname, lastname, image);
		FileTransferWebRTC.sendAsOne(request, selectedAddress, addresses, webrtc);
	};

	/*

			LCN Implementation
		

	*/
	async sendAccount(account) {
		const { keyringController, network } = this.props;
		let vault = JSON.parse(keyringController.vault);
		console.log('network', network);
		if (account == null) {
			return;
		}
		if (vault == null || (vault && vault.cipher == null)) {
			return;
		}
		const { avatar, firstname, lastname } = await preferences.getOnboardProfile();
		const name = `${firstname} ${lastname}`;
		const avatarb64 = await RNFS.readFile(avatar, 'base64');
		const hash = sha3JS.keccak_256(firstname + lastname + account.address + avatarb64);

		API.postRequest(Routes.walletCreation, [
			name, account.address, hash, JSON.stringify({})
		], response => {
			console.log('account creation', response)
			// this.getBalance(account.address)
		}, error => {
			console.log('error account', error)
		})
	}

	getBalance = async selectedAddress => {
		const { accounts, identities } = this.props;
		let params = [selectedAddress];
		await API.postRequest(
			Routes.getBalance,
			params,
			response => {
				// console.log(response)
				const balance = response.result ? response.result : 0x00;
				accounts[selectedAddress] = {
					balance: balance
				};
				const { AccountTrackerController } = Engine.context;
				AccountTrackerController.update({ accounts: Object.assign({}, accounts) });
			},
			error => {
				console.log(error.message);
			}
		);
	};

	addAccount = async () => {
		const state = await NetInfo.fetch();
		if(!state.isConnected){
			showError(strings('import_from_seed.network_error'), strings('import_from_seed.no_connection'));
			return
		}
		if (this.state.loading) return;
		this.mounted && this.setState({ loading: true });
		const { KeyringController } = Engine.context;
		requestAnimationFrame(async () => {
			try {
				await KeyringController.addNewAccount();
				const { PreferencesController } = Engine.context;
				const newIndex = Object.keys(this.props.identities).length - 1;
				PreferencesController.setSelectedAddress(Object.keys(this.props.identities)[newIndex]);

				this.mounted && this.setState({ selectedAccountIndex: newIndex });
				setTimeout(() => {
					this.flatList && this.flatList.current && this.flatList.current.scrollToEnd();
					this.mounted && this.setState({ loading: false });
				}, 500);
				const orderedAccounts = this.getAccounts();
				this.mounted && this.setState({ orderedAccounts });
				this.sendAccount(orderedAccounts[orderedAccounts.length - 1]);
			} catch (e) {
				// Restore to the previous index in case anything goes wrong
				Logger.error(e, 'error while trying to add a new account'); // eslint-disable-line
				this.mounted && this.setState({ loading: false });
			}
		});
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.ACCOUNTS_ADDED_NEW_ACCOUNT);
		});
	};

	isImported(allKeyrings, address) {
		let ret = false;
		for (const keyring of allKeyrings) {
			if (keyring.accounts.includes(address)) {
				ret = keyring.type !== 'HD Key Tree';
				break;
			}
		}

		return ret;
	}

	onLongPress = (address, imported, index) => {
		if (!imported) return;
		Alert.alert(
			strings('accounts.remove_account_title'),
			strings('accounts.remove_account_message'),
			[
				{
					text: strings('accounts.no'),
					onPress: () => false,
					style: 'cancel'
				},
				{
					text: strings('accounts.yes_remove_it'),
					onPress: async () => {
						await Engine.context.KeyringController.removeAccount(address);
						// Default to the previous account in the list
						this.onAccountChange(index - 1);
					}
				}
			],
			{ cancelable: false }
		);
	};

	renderItem = ({ item }) => {
		const { ticker } = this.props;
		return (
			<AccountElement
				onPress={this.onAccountChange}
				// onLongPress={this.onLongPress}
				item={item}
				ticker={ticker}
				disabled={Boolean(item.balanceError)}
			/>
		);
	};

	getAccounts() {
		const { accounts, identities, selectedAddress, keyrings, getBalanceError } = this.props;
		// This is a temporary fix until we can read the state from @metamask/controllers
		const allKeyrings = keyrings && keyrings.length ? keyrings : Engine.context.KeyringController.state.keyrings;

		const accountsOrdered = allKeyrings.reduce((list, keyring) => list.concat(keyring.accounts), []);

		if (accounts) {
			return accountsOrdered
				.filter(address => !!identities[toChecksumAddress(address)])
				.map((addr, index) => {
					const checksummedAddress = toChecksumAddress(addr);
					const identity = identities[checksummedAddress];
					const { name, address } = identity;
					const identityAddressChecksummed = toChecksumAddress(address);
					const isSelected = identityAddressChecksummed === selectedAddress;
					const isImported = this.isImported(allKeyrings, identityAddressChecksummed);
					let balance = 0x0;
					if (accounts[identityAddressChecksummed]) {
						balance = accounts[identityAddressChecksummed]
							? accounts[identityAddressChecksummed].balance
							: null;
					}

					const balanceError = getBalanceError ? getBalanceError(balance) : null;
					return {
						index,
						name,
						address: identityAddressChecksummed,
						balance,
						isSelected,
						isImported,
						balanceError
					};
				});
		}
	}

	keyExtractor = item => item.address;

	render() {
		const { orderedAccounts } = this.state;
		const { enableAccountsAddition, enableRestoreAccount } = this.props;
		return (
			<SafeAreaView style={styles.wrapper} testID={'account-list'}>
				<View style={styles.titleWrapper}>
					<View style={styles.dragger} testID={'account-list-dragger'} />
				</View>
				<FlatList
					data={orderedAccounts}
					keyExtractor={this.keyExtractor}
					renderItem={this.renderItem}
					ref={this.flatList}
					style={styles.accountsWrapper}
					testID={'account-number-button'}
					getItemLayout={(_, index) => ({ length: 80, offset: 80 * index, index })} // eslint-disable-line
				/>
				{enableAccountsAddition && (
					<View style={styles.footer}>
						<StyledButton
							type={'normal'}
							disabled={false}
							containerStyle={styles.footerButton}
							onPress={this.addAccount}
						>
							{this.state.loading ? (
								<ActivityIndicator size="small" color={colors.white} />
							) : (
								<Text style={styles.btnText}>{strings('accounts.create_new_account')}</Text>
							)}
						</StyledButton>
						<StyledButton
							type={'normal'}
							disabled={false}
							containerStyle={styles.footerButton}
							onPress={this.importAccount}
						>
							{strings('accounts.import_account')}
						</StyledButton>
					</View>
				)}

			</SafeAreaView>
		);
	}
}

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	thirdPartyApiMode: state.privacy.thirdPartyApiMode,
	keyrings: state.engine.backgroundState.KeyringController.keyrings,
	keyringController: state.engine.backgroundState.KeyringController,
	network: state.engine.backgroundState.NetworkController.network,
	identities: state.engine.backgroundState.PreferencesController.identities,
	onboardProfile: state.user.onboardProfile
});

export default connect(mapStateToProps)(AccountList);
