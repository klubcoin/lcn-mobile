import React, { useState, useEffect, useRef, useCallback } from 'react';

import {
	ActivityIndicator,
	AppState,
	StyleSheet,
	View,
	Alert,
	InteractionManager,
	PushNotificationIOS, // eslint-disable-line react-native/split-platform-components
	PanResponder,
	Text,
	TouchableOpacity
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import GlobalAlert from '../../UI/GlobalAlert';
import BackgroundTimer from 'react-native-background-timer';
import Approval from '../../Views/Approval';
import NotificationManager from '../../../core/NotificationManager';
import Engine from '../../../core/Engine';
import AppConstants from '../../../core/AppConstants';
import PushNotification from 'react-native-push-notification';
import I18n, { strings } from '../../../../locales/i18n';
import { colors } from '../../../styles/common';
import LockManager from '../../../core/LockManager';
import FadeOutOverlay from '../../UI/FadeOutOverlay';
import { hexToBN, fromWei, renderFromTokenMinimalUnit } from '../../../util/number';
import { setEtherTransaction, setTransactionObject } from '../../../actions/transaction';
import PersonalSign from '../../UI/PersonalSign';
import TypedSign from '../../UI/TypedSign';
import Modal from 'react-native-modal';
import WalletConnect from '../../../core/WalletConnect';
import Device from '../../../util/Device';
import * as RNFS from 'react-native-fs';
import moment from 'moment';
import {
	getMethodData,
	TOKEN_METHOD_TRANSFER,
	decodeTransferData,
	APPROVE_FUNCTION_SIGNATURE,
	decodeApproveData
} from '../../../util/transactions';
import preferences from '../../../store/preferences';
import { BN, toChecksumAddress } from 'ethereumjs-util';
import Logger from '../../../util/Logger';
import contractMap from '@metamask/contract-metadata';
import Toast from 'react-native-toast-message';
import MessageSign from '../../UI/MessageSign';
import Approve from '../../Views/ApproveView/Approve';
import TransactionTypes from '../../../core/TransactionTypes';
import BackupAlert from '../../UI/BackupAlert';
import Notification from '../../UI/Notification';
import FiatOrders from '../../UI/FiatOrders';
import {
	showTransactionNotification,
	hideCurrentNotification,
	showSimpleNotification,
	removeNotificationById,
	removeNotVisibleNotifications
} from '../../../actions/notification';
import {
	toggleDappTransactionModal,
	toggleApproveModal,
	showConfirmOtherIdentityPrompt,
	toggleFriendRequestQR,
	showTipperModal
} from '../../../actions/modals';
import { setOnboardProfile } from '../../../actions/user';
import AccountApproval from '../../UI/AccountApproval';
import ProtectYourWalletModal from '../../UI/ProtectYourWalletModal';
import MainNavigator from './MainNavigator';
import SkipAccountSecurityModal from '../../UI/SkipAccountSecurityModal';
import { swapsUtils } from '@metamask/swaps-controller';
import { util } from '@metamask/controllers';
import SwapsLiveness from '../../UI/Swaps/SwapsLiveness';
import Analytics from '../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import BigNumber from 'bignumber.js';
import { setInfuraAvailabilityBlocked, setInfuraAvailabilityNotBlocked } from '../../../actions/infuraAvailability';
import { FriendRequestTypes, LiquichainNameCard, WalletProfile } from '../../Views/Contacts/FriendRequestMessages';
import FriendMessageOverview from '../../Views/Contacts/widgets/FriendMessageOverview';
import WebRTC, { refWebRTC, setWebRTC } from '../../../services/WebRTC';
import CryptoSignature from '../../../core/CryptoSignature';
import { Chat } from '../../Views/Message/store/Messages';
import { ConfirmProfileBlock, ConfirmProfileRejected, ConfirmProfileRequest } from '../../../services/Messages';
import ConfirmIdentity from '../../Views/ConfirmIdentity';
import * as base64 from 'base-64';
import EncryptionWebRTC from '../../../services/EncryptionWebRTC';
import store from '../../Views/MarketPlace/store';
import StoreService, { setStoreService } from '../../Views/MarketPlace/store/StoreService';
import ChatService, { setChatService } from '../../Views/Message/store/ChatService';
import messageStore from '../../Views/Message/store';
import FileTransferService, { setFileTransferService } from '../../Views/FilesManager/store/FileTransferService';
import TipperModal from '../../Views/Tipper/TipperModal';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import StyledButton from '../../UI/StyledButton';
import SecureKeychain from '../../../core/SecureKeychain';
import { passwordRequirementsMet } from '../../../util/password';
import {
	BACKUP,
	BACKUP_TYPE,
	BIOMETRY_CHOICE,
	BIOMETRY_CHOICE_DISABLED,
	PASSCODE_CHOICE,
	PASSCODE_DISABLED,
	TRUE
} from '../../../constants/storage';
import AsyncStorage from '@react-native-community/async-storage';
import { toLowerCaseCompare } from '../../../util/general';
import { displayName } from '../../../../app.json';
import { OutlinedTextField, FilledTextField } from 'react-native-material-textfield';

const styles = StyleSheet.create({
	flex: {
		flex: 1,
		paddingTop: Device.isIos() ? 20 : 0
	},
	loader: {
		backgroundColor: colors.white,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0
	},
	lockModal: {
		backgroundColor: colors.transparent,
		alignItems: 'center'
	},
	lockModalContent: {
		width: '100%',
		paddingHorizontal: 12
	},
	lockModalTitle: {
		color: colors.white,
		fontSize: 20,
		alignSelf: 'center'
	},
	passwordWrapper: {},
	passwordTitle: {
		color: colors.white,
		marginTop: 40,
		marginBottom: 12
	},
	passwordInputWrapper: {
		backgroundColor: colors.purple,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12
	},
	passwordError: {
		color: colors.red,
		marginBottom: 12
	},
	passwordInput: {
		flex: 1,
		color: colors.white
	},
	biometricButton: {
		backgroundColor: colors.purple,
		width: 40,
		height: 40,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: -8
	},
	button: {},
	biometricIcon: {},
	inputContainer: {
		width: '100%',
		paddingHorizontal: 15,
		borderRadius: 15,
		backgroundColor: colors.purple
	}
});
const Main = props => {
	const [friendMessage, setFriendMessage] = useState(null);
	const [acceptedNameCardVisible, showAcceptedNameCard] = useState(null);
	const [identity2Confirm, showConfirmOtherIdentity] = useState(null);

	const [connected, setConnected] = useState(true);
	const [forceReload, setForceReload] = useState(false);
	const [signMessage, setSignMessage] = useState(false);
	const [signMessageParams, setSignMessageParams] = useState({ data: '' });
	const [signType, setSignType] = useState(false);
	const [walletConnectRequest, setWalletConnectRequest] = useState(false);
	const [walletConnectRequestInfo, setWalletConnectRequestInfo] = useState(false);
	const [showExpandedMessage, setShowExpandedMessage] = useState(false);
	const [currentPageTitle, setCurrentPageTitle] = useState('');
	const [currentPageUrl, setCurrentPageUrl] = useState('');
	const [currentPageIcon, setCurrentPageIcon] = useState('');
	const [panResponder, setPanResponder] = useState({});
	const [showRemindLaterModal, setShowRemindLaterModal] = useState(false);
	const [skipCheckbox, setSkipCheckbox] = useState(false);
	const [lock, setLock] = useState(false);
	const [activeTime, setActiveTime] = useState(new Date());
	const [password, setPassword] = useState('');
	const [passwordErrorString, setPasswordErrorString] = useState('');
	const [lockType, setLockType] = useState({ biometric: false, passcode: false });

	const passwordRef = useRef();

	const backgroundMode = useRef(false);
	const locale = useRef(I18n.locale);
	const lockManager = useRef();
	const removeConnectionStatusListener = useRef();

	const setTransactionObject = props.setTransactionObject;
	const toggleApproveModal = props.toggleApproveModal;
	const toggleDappTransactionModal = props.toggleDappTransactionModal;
	const setEtherTransaction = props.setEtherTransaction;

	const WRONG_PASSWORD_ERROR = strings('login.wrong_password_error');
	const WRONG_PASSWORD_ERROR_ANDROID = strings('login.wrong_password_error_android');
	const VAULT_ERROR = strings('login.vault_error');

	const checkLockType = async () => {
		const passcodeDisable = await AsyncStorage.getItem(PASSCODE_DISABLED);
		const biometricDisable = await AsyncStorage.getItem(BIOMETRY_CHOICE_DISABLED);
		const passcode = await AsyncStorage.getItem(PASSCODE_CHOICE);
		const biometric = await AsyncStorage.getItem(BIOMETRY_CHOICE);
		setLockType({
			passcode: !(passcodeDisable === TRUE) && !(passcode === TRUE),
			biometric: biometric === TRUE
		});
	};

	useEffect(() => {
		checkLockType();
	}, [lock]);

	useEffect(() => {
		setPanResponder(
			PanResponder.create({
				onStartShouldSetPanResponder: () => {
					setActiveTime(new Date());
				},
				onMoveShouldSetPanResponder: () => {
					setActiveTime(new Date());
				},
				onStartShouldSetPanResponderCapture: () => {
					setActiveTime(new Date());
				},
				onMoveShouldSetPanResponderCapture: () => {
					setActiveTime(new Date());
				},
				onPanResponderTerminationRequest: () => {
					setActiveTime(new Date());
				},
				onShouldBlockNativeResponder: () => {
					setActiveTime(new Date());
				}
			})
		);
	}, []);

	useEffect(() => {
		if (props.lockTime >= 0) {
			const timeout = setTimeout(() => {
				setLock(true);
				setPasswordErrorString('');
			}, props.lockTime + 5000);
			return () => clearTimeout(timeout);
		}
	}, [activeTime, props.lockTime]);

	const usePrevious = value => {
		const ref = useRef();
		useEffect(() => {
			ref.current = value;
		});
		return ref.current;
	};

	const prevLockTime = usePrevious(props.lockTime);

	const pollForIncomingTransactions = useCallback(async () => {
		props.thirdPartyApiMode && (await Engine.refreshTransactionHistory());
		// Stop polling if the app is in the background
		if (!backgroundMode.current) {
			setTimeout(() => {
				pollForIncomingTransactions();
			}, AppConstants.TX_CHECK_NORMAL_FREQUENCY);
		}
	}, [backgroundMode, props.thirdPartyApiMode]);

	const onUnapprovedMessage = (messageParams, type) => {
		const { title: currentPageTitle, url: currentPageUrl, icon } = messageParams.meta;
		delete messageParams.meta;
		setSignMessageParams(messageParams);
		setSignType(type);
		setCurrentPageTitle(currentPageTitle);
		setCurrentPageUrl(currentPageUrl);
		setCurrentPageIcon(icon);
		setSignMessage(true);
	};

	useEffect(() => {
		navigateChangeHandler();
	}, [props.navigation]);

	const connectionChangeHandler = useCallback(
		state => {
			if (!state) return;
			const { isConnected } = state;
			// Show the modal once the status changes to offline
			if (props.navigation.state.routeName !== 'OfflineModeView' && isConnected === false) {
				props.navigation.navigate('OfflineModeView');
			}
			setConnected(isConnected);
		},
		[connected, setConnected, props.navigation]
	);

	const navigateChangeHandler = useCallback(() => {
		if (props.navigation.state.routeName !== 'OfflineModeView' && connected === false) {
			props.navigation.navigate('OfflineModeView');
		}
	}, [connected, setConnected, props.navigation]);

	const checkInfuraAvailability = useCallback(async () => {
		if (props.providerType !== 'rpc') {
			try {
				const { TransactionController } = Engine.context;
				await util.query(TransactionController.ethQuery, 'blockNumber', []);
				props.setInfuraAvailabilityNotBlocked();
			} catch (e) {
				if (e.message === AppConstants.ERRORS.INFURA_BLOCKED_MESSAGE) {
					props.navigation.navigate('OfflineModeView');
					props.setInfuraAvailabilityBlocked();
				}
			}
		} else {
			props.setInfuraAvailabilityNotBlocked();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		props.navigation,
		props.providerType,
		props.setInfuraAvailabilityBlocked,
		props.setInfuraAvailabilityNotBlocked
	]);

	const initializeWalletConnect = () => {
		WalletConnect.hub.on('walletconnectSessionRequest', peerInfo => {
			setWalletConnectRequest(true);
			setWalletConnectRequestInfo(peerInfo);
		});
		WalletConnect.init();
	};

	const trackSwaps = useCallback(
		async (event, transactionMeta) => {
			try {
				const { TransactionController } = Engine.context;
				const newSwapsTransactions = props.swapsTransactions;
				const swapTransaction = newSwapsTransactions[transactionMeta.id];
				const {
					sentAt,
					gasEstimate,
					ethAccountBalance,
					approvalTransactionMetaId
				} = swapTransaction.paramsForAnalytics;

				const approvalTransaction = TransactionController.state.transactions.find(
					({ id }) => id === approvalTransactionMetaId
				);
				const ethBalance = await util.query(TransactionController.ethQuery, 'getBalance', [
					props.selectedAddress
				]);
				const receipt = await util.query(TransactionController.ethQuery, 'getTransactionReceipt', [
					transactionMeta.transactionHash
				]);

				const currentBlock = await util.query(TransactionController.ethQuery, 'getBlockByHash', [
					receipt.blockHash,
					false
				]);
				let approvalReceipt;
				if (approvalTransaction?.transactionHash) {
					approvalReceipt = await util.query(TransactionController.ethQuery, 'getTransactionReceipt', [
						approvalTransaction.transactionHash
					]);
				}
				const tokensReceived = swapsUtils.getSwapsTokensReceived(
					receipt,
					approvalReceipt,
					transactionMeta?.transaction,
					approvalTransaction?.transaction,
					swapTransaction.destinationToken,
					ethAccountBalance,
					ethBalance
				);

				newSwapsTransactions[transactionMeta.id].gasUsed = receipt.gasUsed;
				if (tokensReceived) {
					newSwapsTransactions[transactionMeta.id].receivedDestinationAmount = new BigNumber(
						tokensReceived,
						16
					).toString(10);
				}
				TransactionController.update({ swapsTransactions: newSwapsTransactions });

				const timeToMine = currentBlock.timestamp - sentAt;
				const estimatedVsUsedGasRatio = `${new BigNumber(receipt.gasUsed)
					.div(gasEstimate)
					.times(100)
					.toFixed(2)}%`;
				const quoteVsExecutionRatio = `${swapsUtils
					.calcTokenAmount(tokensReceived || '0x0', swapTransaction.destinationTokenDecimals)
					.div(swapTransaction.destinationAmount)
					.times(100)
					.toFixed(2)}%`;
				const tokenToAmountReceived = swapsUtils.calcTokenAmount(
					tokensReceived,
					swapTransaction.destinationToken.decimals
				);
				const analyticsParams = { ...swapTransaction.analytics };
				delete newSwapsTransactions[transactionMeta.id].analytics;
				delete newSwapsTransactions[transactionMeta.id].paramsForAnalytics;

				InteractionManager.runAfterInteractions(() => {
					const parameters = {
						...analyticsParams,
						time_to_mine: timeToMine,
						estimated_vs_used_gasRatio: estimatedVsUsedGasRatio,
						quote_vs_executionRatio: quoteVsExecutionRatio,
						token_to_amount_received: tokenToAmountReceived.toString()
					};
					Analytics.trackEventWithParameters(event, {});
					Analytics.trackEventWithParameters(event, parameters, true);
				});
			} catch (e) {
				Logger.error(e, ANALYTICS_EVENT_OPTS.SWAP_TRACKING_FAILED);
				InteractionManager.runAfterInteractions(() => {
					Analytics.trackEvent(ANALYTICS_EVENT_OPTS.SWAP_TRACKING_FAILED, { error: e });
				});
			}
		},
		[props.selectedAddress, props.swapsTransactions]
	);

	const autoSign = useCallback(
		async transactionMeta => {
			const { TransactionController } = Engine.context;
			try {
				TransactionController.hub.once(`${transactionMeta.id}:finished`, transactionMeta => {
					if (transactionMeta.status === 'submitted') {
						props.navigation.pop();
						NotificationManager.watchSubmittedTransaction({
							...transactionMeta,
							assetType: transactionMeta.transaction.assetType
						});
					} else {
						if (props.swapsTransactions[transactionMeta.id]?.analytics) {
							trackSwaps(ANALYTICS_EVENT_OPTS.SWAP_FAILED, transactionMeta);
						}
						throw transactionMeta.error;
					}
				});
				TransactionController.hub.once(`${transactionMeta.id}:confirmed`, transactionMeta => {
					if (props.swapsTransactions[transactionMeta.id]?.analytics) {
						trackSwaps(ANALYTICS_EVENT_OPTS.SWAP_COMPLETED, transactionMeta);
					}
				});
				await TransactionController.approveTransaction(transactionMeta.id);
			} catch (error) {
				Alert.alert(strings('transactions.transaction_error'), error && error.message, [
					{ text: strings('navigation.ok') }
				]);
				Logger.error(error, 'error while trying to send transaction (Main)');
			}
		},
		[props.navigation, props.swapsTransactions, trackSwaps]
	);

	const onUnapprovedTransaction = useCallback(
		async transactionMeta => {
			if (transactionMeta.origin === TransactionTypes.MMM) return;

			const to = transactionMeta.transaction.to?.toLowerCase();
			const { data } = transactionMeta.transaction;

			// if approval data includes metaswap contract
			// if destination address is metaswap contract
			if (
				to &&
				(to === swapsUtils.getSwapsContractAddress(props.chainId) ||
					(data &&
						data.substr(0, 10) === APPROVE_FUNCTION_SIGNATURE &&
						decodeApproveData(data).spenderAddress?.toLowerCase() ===
							swapsUtils.getSwapsContractAddress(props.chainId)))
			) {
				if (transactionMeta.origin === process.env.MM_FOX_CODE) {
					autoSign(transactionMeta);
				}
			} else {
				const {
					transaction: { value, gas, gasPrice, data }
				} = transactionMeta;
				const { AssetsContractController } = Engine.context;
				transactionMeta.transaction.gas = hexToBN(gas);
				transactionMeta.transaction.gasPrice = hexToBN(gasPrice);

				if (
					(value === '0x0' || !value) &&
					data &&
					data !== '0x' &&
					to &&
					(await getMethodData(data)).name === TOKEN_METHOD_TRANSFER
				) {
					let asset = props.tokens.find(({ address }) => address === to);
					if (!asset && contractMap[to]) {
						asset = contractMap[to];
					} else if (!asset) {
						try {
							asset = {};
							asset.decimals = await AssetsContractController.getTokenDecimals(to);
							asset.symbol = await AssetsContractController.getAssetSymbol(to);
						} catch (e) {
							// This could fail when requesting a transfer in other network
							asset = { symbol: 'ERC20', decimals: new BN(0) };
						}
					}

					const decodedData = decodeTransferData('transfer', data);
					transactionMeta.transaction.value = hexToBN(decodedData[2]);
					transactionMeta.transaction.readableValue = renderFromTokenMinimalUnit(
						hexToBN(decodedData[2]),
						asset.decimals
					);
					transactionMeta.transaction.to = decodedData[0];

					setTransactionObject({
						type: 'INDIVIDUAL_TOKEN_TRANSACTION',
						selectedAsset: asset,
						id: transactionMeta.id,
						origin: transactionMeta.origin,
						...transactionMeta.transaction
					});
				} else {
					transactionMeta.transaction.value = hexToBN(value);
					transactionMeta.transaction.readableValue = fromWei(transactionMeta.transaction.value);

					setEtherTransaction({
						id: transactionMeta.id,
						origin: transactionMeta.origin,
						...transactionMeta.transaction
					});
				}

				if (data && data.substr(0, 10) === APPROVE_FUNCTION_SIGNATURE) {
					toggleApproveModal();
				} else {
					toggleDappTransactionModal();
				}
			}
		},
		[
			props.tokens,
			props.chainId,
			setEtherTransaction,
			setTransactionObject,
			toggleApproveModal,
			toggleDappTransactionModal,
			autoSign
		]
	);

	const handleAppStateChange = useCallback(
		appState => {
			let lockTimer = null;
			setActiveTime(new Date());
			if (appState !== 'active') {
				// Auto-lock immediately
				lockTimer = BackgroundTimer.setTimeout(() => {
					setLock(false);
				}, props.lockTime);
			}
			if (appState === 'active') {
				return lockTimer && BackgroundTimer.clearTimeout(lockTimer);
			}
			const newModeIsBackground = appState === 'background';
			// If it was in background and it's not anymore
			// we need to stop the Background timer
			if (backgroundMode.current && !newModeIsBackground) {
				BackgroundTimer.stop();
				pollForIncomingTransactions();
			}

			backgroundMode.current = newModeIsBackground;

			// If the app is now in background, we need to start
			// the background timer, which is less intense
			if (backgroundMode.current) {
				BackgroundTimer.runBackgroundTimer(async () => {
					await Engine.refreshTransactionHistory();
				}, AppConstants.TX_CHECK_BACKGROUND_FREQUENCY);
			}
		},
		[backgroundMode, pollForIncomingTransactions]
	);

	const initForceReload = () => {
		// Force unmount the webview to avoid caching problems
		setForceReload(true);
		setTimeout(() => {
			setForceReload(false);
		}, 1000);
	};

	const renderLoader = () => (
		<View style={styles.loader}>
			<ActivityIndicator size="small" />
		</View>
	);

	const onSignAction = () => setSignMessage(false);

	const toggleExpandedMessage = () => setShowExpandedMessage(!showExpandedMessage);

	const renderSigningModal = () => (
		<Modal
			isVisible={signMessage}
			animationIn="slideInUp"
			animationOut="slideOutDown"
			style={styles.bottomModal}
			backdropOpacity={0.7}
			animationInTiming={600}
			animationOutTiming={600}
			onBackdropPress={onSignAction}
			onBackButtonPress={showExpandedMessage ? toggleExpandedMessage : onSignAction}
			onSwipeComplete={onSignAction}
			swipeDirection={'down'}
			propagateSwipe
		>
			{signType === 'personal' && (
				<PersonalSign
					messageParams={signMessageParams}
					onCancel={onSignAction}
					onConfirm={onSignAction}
					currentPageInformation={{ title: currentPageTitle, url: currentPageUrl }}
					toggleExpandedMessage={toggleExpandedMessage}
					showExpandedMessage={showExpandedMessage}
				/>
			)}
			{signType === 'typed' && (
				<TypedSign
					messageParams={signMessageParams}
					onCancel={onSignAction}
					onConfirm={onSignAction}
					currentPageInformation={{ title: currentPageTitle, url: currentPageUrl, icon: currentPageIcon }}
					toggleExpandedMessage={toggleExpandedMessage}
					showExpandedMessage={showExpandedMessage}
				/>
			)}
			{signType === 'eth' && (
				<MessageSign
					navigation={props.navigation}
					messageParams={signMessageParams}
					onCancel={onSignAction}
					onConfirm={onSignAction}
					currentPageInformation={{ title: currentPageTitle, url: currentPageUrl }}
					toggleExpandedMessage={toggleExpandedMessage}
					showExpandedMessage={showExpandedMessage}
				/>
			)}
		</Modal>
	);

	const handleLogin = async password => {
		try {
			const { KeyringController } = Engine.context;

			setPassword('');
			passwordRef?.current?.setValue('');
			await KeyringController.exportSeedPhrase(password);
			setActiveTime(new Date());
			setPasswordErrorString('');
			setLock(false);
		} catch (e) {
			const error = e.toString();
			if (
				toLowerCaseCompare(error, WRONG_PASSWORD_ERROR) ||
				toLowerCaseCompare(error, WRONG_PASSWORD_ERROR_ANDROID)
			) {
				setPasswordErrorString(strings('login.invalid_password'));
				return;
			} else if (toLowerCaseCompare(error, VAULT_ERROR)) {
				setPasswordErrorString(strings('login.clean_vault_error', { appName: displayName }));
			} else {
				setPasswordErrorString(error);
			}
		}
	};

	const onLogin = async (usePassword = '') => {
		passwordRef?.current?.blur();
		const locked = !passwordRequirementsMet(usePassword);
		if (locked) setPasswordErrorString(strings('login.invalid_password'));
		handleLogin(usePassword);
	};

	const tryBiometric = async e => {
		passwordRef?.current?.blur();
		if (e) e?.preventDefault();
		try {
			const credentials = await SecureKeychain.getGenericPassword();
			if (!credentials) return false;
			setPassword(credentials.password);
			onLogin(credentials.password);
		} catch (error) {}
		return true;
	};

	const renderLockModal = () => (
		<Modal
			isVisible={lock}
			animationIn="shake"
			animationOut="fadeOut"
			style={styles.lockModal}
			backdropColor={colors.primaryFox}
			backdropOpacity={1}
			animationInTiming={600}
			animationOutTiming={600}
			onBackdropPress={onSignAction}
			onBackButtonPress={showExpandedMessage ? toggleExpandedMessage : onSignAction}
			onSwipeComplete={onSignAction}
			swipeDirection={'down'}
			propagateSwipe
		>
			<View style={styles.lockModalContent}>
				<Text style={styles.lockModalTitle}>{strings('lock_modal.title')}</Text>
				<View style={styles.passwordWrapper}>
					<Text style={styles.passwordTitle}>{strings('login.password')}</Text>
					<OutlinedTextField
						inputContainerStyle={styles.inputContainer}
						style={styles.passwordInput}
						secureTextEntry={true}
						autoCapitalize="none"
						value={password}
						onChangeText={text => {
							setPassword(text);
							setPasswordErrorString('');
						}}
						ref={passwordRef}
						renderRightAccessory={() =>
							lockType.biometric && (
								<TouchableOpacity style={styles.biometricButton} onPress={tryBiometric}>
									<MaterialIcon
										color={colors.white}
										style={styles.biometricIcon}
										size={28}
										name="fingerprint"
									/>
								</TouchableOpacity>
							)
						}
					/>
					{!!passwordErrorString && <Text style={styles.passwordError}>{passwordErrorString}</Text>}
					<View style={styles.button}>
						<StyledButton type={'normal-padding'} onPress={() => onLogin(password)}>
							{strings('login.login_button')}
						</StyledButton>
					</View>
				</View>
			</View>
		</Modal>
	);

	const onWalletConnectSessionApproval = () => {
		const { peerId } = walletConnectRequestInfo;
		setWalletConnectRequest(false);
		setWalletConnectRequestInfo({});
		WalletConnect.hub.emit('walletconnectSessionRequest::approved', peerId);
	};

	const onWalletConnectSessionRejected = () => {
		const peerId = walletConnectRequestInfo.peerId;
		setWalletConnectRequest(false);
		setWalletConnectRequestInfo({});
		WalletConnect.hub.emit('walletconnectSessionRequest::rejected', peerId);
	};

	const renderWalletConnectSessionRequestModal = () => {
		const meta = walletConnectRequestInfo.peerMeta || null;
		return (
			<Modal
				isVisible={walletConnectRequest}
				animationIn="slideInUp"
				animationOut="slideOutDown"
				style={styles.bottomModal}
				backdropOpacity={0.7}
				animationInTiming={300}
				animationOutTiming={300}
				onSwipeComplete={onWalletConnectSessionRejected}
				onBackButtonPress={onWalletConnectSessionRejected}
				swipeDirection={'down'}
			>
				<AccountApproval
					onCancel={onWalletConnectSessionRejected}
					onConfirm={onWalletConnectSessionApproval}
					currentPageInformation={{
						title: meta && meta.name,
						url: meta && meta.url
					}}
					walletConnectRequest
				/>
			</Modal>
		);
	};

	const renderDappTransactionModal = () =>
		props.dappTransactionModalVisible && (
			<Approval
				navigation={props.navigation}
				dappTransactionModalVisible
				toggleDappTransactionModal={props.toggleDappTransactionModal}
			/>
		);

	const renderApproveModal = () =>
		props.approveModalVisible && <Approve modalVisible toggleApproveModal={props.toggleApproveModal} />;

	const toggleRemindLater = () => {
		setShowRemindLaterModal(!showRemindLaterModal);
	};

	const toggleSkipCheckbox = () => {
		setSkipCheckbox(!skipCheckbox);
	};

	const skipAccountModalSecureNow = async () => {
		toggleRemindLater();
		await AsyncStorage.setItem(BACKUP, BACKUP_TYPE.ALERT);
		props.navigation.navigate('ManualBackupStep1', { ...props.navigation.state.params });
	};

	const skipAccountModalSkip = () => {
		if (skipCheckbox) toggleRemindLater();
	};

	const ensureOnboardProfile = async () => {
		const profile = await preferences.getOnboardProfile();
		props.setOnboardProfile(profile);
	};

	useEffect(() => {
		if (locale.current !== I18n.locale) {
			locale.current = I18n.locale;
			initForceReload();
			return;
		}
		if (prevLockTime !== props.lockTime) {
			lockManager.current && lockManager.current.updateLockTime(props.lockTime);
		}
		ensureOnboardProfile();
	});

	const handleFriendRequestUpdate = message => {
		const { data } = message;
		if (data) {
			if (data.type == FriendRequestTypes.Accept) {
				getPeerInfo(message);
				handleAcceptedNameCard(data);
			} else if (data.type == FriendRequestTypes.Revoke) {
				setFriendMessage(message);
				revokeFriend(data);
			}
		}
	};

	const getPeerInfo = async message => {
		const address = message.from;
		const profile = await preferences.peerProfile(address);

		if (profile && profile.name) {
			Object.assign(message.data, profile, { address });
			setFriendMessage(message);
			return;
		}
		// request if not yet exists
		const webrtc = refWebRTC();
		webrtc.once(`${WalletProfile().action}:${address.toLowerCase()}`, data => {
			if (!data.profile) return true;
			Object.assign(message.data, data.profile, { address });
			setFriendMessage(message);
		});
		webrtc.sendToPeer(address, WalletProfile());
	};

	const handleAcceptedNameCard = data => {
		props.toggleFriendRequestQR(false);
		setTimeout(() => showAcceptedNameCard(data.from), 500);
	};

	const revokeFriend = data => {
		const { from, name } = data;
		alert(`${name} (${from}) revoked friend`);
	};

	const bindPrivateKey = async address => {
		const { KeyringController } = Engine.context;

		const password = await preferences.getKeycloakHash();
		const privateKey = await KeyringController.exportAccount(password, address);
		const publicKey = await CryptoSignature.getEncryptionPublicKey(privateKey);

		return { privateKey, publicKey };
	};

	const initializeServices = async address => {
		const apps = await preferences.getSavedAppList();
		const marketApp = apps.find(app => app.instance.name == 'Liquimart');
		// if (marketApp) {
		await store.load();
		const storeService = new StoreService(address);
		setStoreService(storeService);
		storeService.announceToTracker();
		// }

		const chatApp = apps.find(app => app.instance.name == 'Liquichat');
		// if (chatApp) {
		await messageStore.load();
		const chatService = new ChatService(address);
		setChatService(chatService);
		// }

		const fileService = new FileTransferService(address);
		setFileTransferService(fileService);
	};

	// Remove all notifications that aren't visible
	useEffect(
		() => {
			const { selectedAddress } = props;
			const address = selectedAddress.toLowerCase();
			props.removeNotVisibleNotifications();

			const webrtc = new WebRTC(address);
			setWebRTC(webrtc);
			const encryptor = new EncryptionWebRTC(address);
			webrtc.addEncryptor(encryptor);
			encryptor.setKeyPairHandler(bindPrivateKey);
			const revokeWebRTC = webrtc.addListener('message', onWebRtcMessage);
			initializeServices(address);

			return () => {
				revokeWebRTC();
			};
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	// unapprovedTransaction effect
	useEffect(() => {
		Engine.context.TransactionController.hub.on('unapprovedTransaction', onUnapprovedTransaction);
		return () => {
			Engine.context.TransactionController.hub.removeListener('unapprovedTransaction', onUnapprovedTransaction);
		};
	}, [onUnapprovedTransaction]);

	useEffect(() => {
		initializeWalletConnect();
		AppState.addEventListener('change', handleAppStateChange);
		lockManager.current = new LockManager(props.navigation, props.lockTime);
		PushNotification.configure({
			requestPermissions: false,
			onNotification: notification => {
				let data = null;
				if (Device.isAndroid()) {
					if (notification.tag) {
						data = JSON.parse(notification.tag);
					}
				} else if (notification.data) {
					data = notification.data;
				}
				if (data && data.action === 'tx') {
					if (data.id) {
						NotificationManager.setTransactionToView(data.id);
					}
					props.navigation.navigate('TransactionsHome');
				}

				if (Device.isIos()) {
					notification.finish(PushNotificationIOS.FetchResult.NoData);
				}
			}
		});

		Engine.context.MessageManager.hub.on('unapprovedMessage', messageParams =>
			onUnapprovedMessage(messageParams, 'eth')
		);

		Engine.context.PersonalMessageManager.hub.on('unapprovedMessage', messageParams =>
			onUnapprovedMessage(messageParams, 'personal')
		);

		Engine.context.TypedMessageManager.hub.on('unapprovedMessage', messageParams =>
			onUnapprovedMessage(messageParams, 'typed')
		);

		setTimeout(() => {
			NotificationManager.init({
				navigation: props.navigation,
				showTransactionNotification: props.showTransactionNotification,
				hideCurrentNotification: props.hideCurrentNotification,
				showSimpleNotification: props.showSimpleNotification,
				removeNotificationById: props.removeNotificationById
			});
			pollForIncomingTransactions();
			checkInfuraAvailability();
			removeConnectionStatusListener.current = NetInfo.addEventListener(connectionChangeHandler);
		}, 1000);

		return function cleanup() {
			AppState.removeEventListener('change', handleAppStateChange);
			lockManager.current.stopListening();
			Engine.context.PersonalMessageManager.hub.removeAllListeners();
			Engine.context.TypedMessageManager.hub.removeAllListeners();
			WalletConnect.hub.removeAllListeners();
			removeConnectionStatusListener.current && removeConnectionStatusListener.current();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onAddContact = () => {
		const { addressBook, network } = props;
		const { AddressBookController } = Engine.context;

		const addresses = addressBook[network] || {};
		const data = friendMessage;

		if (data && data.data) {
			const payload = data.data;
			const name = payload.name || '';
			const address = toChecksumAddress(data.from);

			if (addresses[address]) return;

			AddressBookController.set(address, name, network);
		}
	};

	const toggleAcceptContactModal = () => {
		showAcceptedNameCard(null);
	};

	const renderAcceptedFriendNameCard = () => {
		return (
			<FriendMessageOverview
				visible={!!acceptedNameCardVisible}
				data={friendMessage?.data}
				networkInfo={friendMessage?.meta}
				title={strings('contacts.friend_request_accepted')}
				message={`${strings('contacts.add_this_contact')}?`}
				confirmLabel={strings('contacts.accept')}
				cancelLabel={strings('contacts.reject')}
				onConfirm={onAddContact}
				hideModal={toggleAcceptContactModal}
			/>
		);
	};

	const showNotice = (message, title) => {
		Toast.show({
			type: 'info',
			text1: message,
			text2: title || strings('profile.notice'),
			visibilityTime: 1000
		});
	};

	const onWebRtcMessage = async (data, peerId) => {
		if (data.action) {
			switch (data.action) {
				case ConfirmProfileRequest().action:
					if (await preferences.isBlockIdentityReqPeer(data.from)) return;
					preferences.addNotification(data);
					showConfirmOtherIdentity(data);
					break;
				case ConfirmProfileRejected().action:
					const name = `${data.firstname} ${data.lastname}`;
					showNotice(strings('confirm_profile.peer_refuse_try_again', { name }));
					preferences.addNotification(data);
					break;
				case ConfirmProfileBlock().action:
					const address = data.from;
					preferences.blockIdentityReqPeer(address);
					break;
				case Chat().action:
					const { from, message } = data;
					const senderId = `${from}`.toLowerCase();
					const activeChatPeerId = `${messageStore.activeChatPeerId}`.toLowerCase();

					const { action } = message;
					if (action) break;

					if (senderId != activeChatPeerId) {
						const { addressBook, network } = props;
						const addresses = addressBook[network] || {};
						const sender = addresses[from];

						showNotice(sender?.name || from, message.text);
					}
					break;
				case LiquichainNameCard().action:
					handleFriendRequestUpdate(data);
					break;
			}
		}
	};

	const renderConfirmOtherIdentity = () => {
		const profile = identity2Confirm || props.otherIdentityToConfirm;
		return (
			<ConfirmIdentity
				visible={!!profile}
				data={profile}
				message={`${strings('confirm_profile.confirm_profile_message')}`}
				hideModal={() => {
					showConfirmOtherIdentity(null);
					props.showConfirmOtherIdentity(null);
				}}
			/>
		);
	};

	const renderTipperModal = () => {
		const { tipperModalData, showTipperModal } = props;

		return (
			tipperModalData && (
				<TipperModal
					visible={!!tipperModalData}
					hideModal={() => showTipperModal(null)}
					title={strings('contacts.friend_request')}
					confirmLabel={strings('tipper.tip')}
					cancelLabel={strings('contacts.reject')}
					data={tipperModalData}
				/>
			)
		);
	};

	return (
		<React.Fragment>
			<View style={styles.flex} {...panResponder.panHandlers}>
				{!forceReload ? (
					<MainNavigator
						navigation={props.navigation}
						screenProps={{
							isPaymentRequest: props.isPaymentRequest
						}}
					/>
				) : (
					renderLoader()
				)}
				<GlobalAlert />
				<FadeOutOverlay />
				<Notification navigation={props.navigation} />
				<FiatOrders />
				<SwapsLiveness />
				<BackupAlert onDismiss={toggleRemindLater} navigation={props.navigation} />
				<SkipAccountSecurityModal
					modalVisible={showRemindLaterModal}
					onCancel={skipAccountModalSecureNow}
					onConfirm={skipAccountModalSkip}
					skipCheckbox={skipCheckbox}
					onPress={skipAccountModalSkip}
					toggleSkipCheckbox={toggleSkipCheckbox}
				/>
				<ProtectYourWalletModal navigation={props.navigation} />
			</View>
			{renderSigningModal()}
			{renderWalletConnectSessionRequestModal()}
			{renderDappTransactionModal()}
			{renderApproveModal()}
			{renderAcceptedFriendNameCard()}
			{renderConfirmOtherIdentity()}
			{renderTipperModal()}
			{(lockType.passcode || lockType.biometric) && renderLockModal()}
		</React.Fragment>
	);
};

Main.router = MainNavigator.router;

Main.propTypes = {
	swapsTransactions: PropTypes.object,
	/**
	 * Object that represents the navigator
	 */
	navigation: PropTypes.object,
	/**
	 * Time to auto-lock the app after it goes in background mode
	 */
	lockTime: PropTypes.number,
	/**
	 * Action that sets an ETH transaction
	 */
	setEtherTransaction: PropTypes.func,
	/**
	 * Action that sets a transaction
	 */
	setTransactionObject: PropTypes.func,
	/**
	 * Array of ERC20 assets
	 */
	tokens: PropTypes.array,
	/**
	 * Dispatch showing a transaction notification
	 */
	showTransactionNotification: PropTypes.func,
	/**
	 * Dispatch showing a simple notification
	 */
	showSimpleNotification: PropTypes.func,
	/**
	 * Dispatch hiding a transaction notification
	 */
	hideCurrentNotification: PropTypes.func,
	removeNotificationById: PropTypes.func,
	/**
	 * Indicates whether the current transaction is a deep link transaction
	 */
	isPaymentRequest: PropTypes.bool,
	/**
	 * Indicates whether third party API mode is enabled
	 */
	thirdPartyApiMode: PropTypes.bool,
	/**
    /* Hides or shows dApp transaction modal
    */
	toggleDappTransactionModal: PropTypes.func,
	/**
    /* Hides or shows approve modal
    */
	toggleApproveModal: PropTypes.func,
	/**
    /* dApp transaction modal visible or not
    */
	dappTransactionModalVisible: PropTypes.bool,
	/**
    /* Token approve modal visible or not
    */
	approveModalVisible: PropTypes.bool,
	/**
	 * Selected address
	 */
	selectedAddress: PropTypes.string,
	/**
	 * Chain id
	 */
	chainId: PropTypes.string,
	/**
	 * Network provider type
	 */
	providerType: PropTypes.string,
	/**
	 * Dispatch infura availability blocked
	 */
	setInfuraAvailabilityBlocked: PropTypes.func,
	/**
	 * Dispatch infura availability not blocked
	 */
	setInfuraAvailabilityNotBlocked: PropTypes.func,
	/**
	 * Remove not visible notifications from state
	 */
	removeNotVisibleNotifications: PropTypes.func
};

const mapStateToProps = state => ({
	lockTime: state.settings.lockTime,
	thirdPartyApiMode: state.privacy.thirdPartyApiMode,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	chainId: state.engine.backgroundState.NetworkController.provider.chainId,
	tokens: state.engine.backgroundState.AssetsController.tokens,
	isPaymentRequest: state.transaction.paymentRequest,
	dappTransactionModalVisible: state.modals.dappTransactionModalVisible,
	approveModalVisible: state.modals.approveModalVisible,
	swapsTransactions: state.engine.backgroundState.TransactionController.swapsTransactions || {},
	providerType: state.engine.backgroundState.NetworkController.provider.type,
	addressBook: state.engine.backgroundState.AddressBookController.addressBook,
	network: state.engine.backgroundState.NetworkController.network,
	identities: state.engine.backgroundState.PreferencesController.identities,
	otherIdentityToConfirm: state.modals.otherIdentityToConfirm,
	tipperModalData: state.modals.tipperModalData
});

const mapDispatchToProps = dispatch => ({
	setEtherTransaction: transaction => dispatch(setEtherTransaction(transaction)),
	setTransactionObject: transaction => dispatch(setTransactionObject(transaction)),
	showTransactionNotification: args => dispatch(showTransactionNotification(args)),
	showSimpleNotification: args => dispatch(showSimpleNotification(args)),
	hideCurrentNotification: () => dispatch(hideCurrentNotification()),
	removeNotificationById: id => dispatch(removeNotificationById(id)),
	toggleDappTransactionModal: (show = null) => dispatch(toggleDappTransactionModal(show)),
	toggleApproveModal: show => dispatch(toggleApproveModal(show)),
	setInfuraAvailabilityBlocked: () => dispatch(setInfuraAvailabilityBlocked()),
	setInfuraAvailabilityNotBlocked: () => dispatch(setInfuraAvailabilityNotBlocked()),
	removeNotVisibleNotifications: () => dispatch(removeNotVisibleNotifications()),
	setOnboardProfile: profile => dispatch(setOnboardProfile(profile)),
	showConfirmOtherIdentity: data => dispatch(showConfirmOtherIdentityPrompt(data)),
	toggleFriendRequestQR: visible => dispatch(toggleFriendRequestQR(visible)),
	showTipperModal: data => dispatch(showTipperModal(data))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Main);
