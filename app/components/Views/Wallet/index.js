import React, { PureComponent } from 'react';
import { TextInput, RefreshControl, ScrollView, InteractionManager, ActivityIndicator, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import { colors, fontStyles, baseStyles } from '../../../styles/common';
import AccountOverview from '../../UI/AccountOverview';
import Tokens from '@UI/Tokens';
import { getWalletNavbarOptions } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import { renderFromWei, weiToFiat, hexToBN } from '../../../util/number';
import Engine from '../../../core/Engine';
import CollectibleContracts from '../../UI/CollectibleContracts';
import Analytics from '../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import { getTicker } from '../../../util/transactions';
import OnboardingWizard from '../../UI/OnboardingWizard';
import { showTransactionNotification, hideCurrentNotification } from '../../../actions/notification';
import ErrorBoundary from '../ErrorBoundary';
import API from 'services/api'
import Routes from 'common/routes';
import StyledButton from '../../UI/StyledButton';
import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc'
import io from 'socket.io-client';
import WebRTC from '../../../services/WebRTC';

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: colors.white
	},
	tabUnderlineStyle: {
		height: 2,
		backgroundColor: colors.blue
	},
	tabStyle: {
		paddingBottom: 0
	},
	textStyle: {
		fontSize: 12,
		letterSpacing: 0.5,
		...fontStyles.bold
	},
	loader: {
		backgroundColor: colors.white,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
});

/**
 * Main view for the wallet
 */
class Wallet extends PureComponent {
	static navigationOptions = ({ navigation }) => getWalletNavbarOptions('wallet.title', navigation);

	static propTypes = {
		/**
		 * Map of accounts to information objects including balances
		 */
		accounts: PropTypes.object,
		/**
		 * ETH to current currency conversion rate
		 */
		conversionRate: PropTypes.number,
		/**
		 * Currency code of the currently-active currency
		 */
		currentCurrency: PropTypes.string,
		/**
		/* navigation object required to push new views
		*/
		navigation: PropTypes.object,
		/**
		 * An object containing each identity in the format address => account
		 */
		identities: PropTypes.object,
		/**
		 * A string that represents the selected address
		 */
		selectedAddress: PropTypes.string,
		/**
		 * An array that represents the user tokens
		 */
		tokens: PropTypes.array,
		/**
		 * An array that represents the user collectibles
		 */
		collectibles: PropTypes.array,
		/**
		 * Current provider ticker
		 */
		ticker: PropTypes.string,
		/**
		 * Current onboarding wizard step
		 */
		wizardStep: PropTypes.number
	};

	state = {
		refreshing: false,
		currentConversion: null,
		webrtcMessage: '',
		webrtcConnected: false
	};

	accountOverviewRef = React.createRef();

	mounted = false;

	componentDidMount = () => {
		const { selectedAddress } = this.props;
		this.webrtc = new WebRTC(selectedAddress);

		this.webrtc.addListener('ready', (sendChannel) => {
			this.sendChannel = sendChannel;
			this.setState({ webrtcConnected: true });
		});
		this.webrtc.addListener('message', (message, peer) => {
			Object.keys(this.webrtc.sendChannels).filter(addr => addr != peer)
				.forEach(peer => this.webrtc.sendToPeer(peer, message));

			this.setState({ webrtcMessage: message })
		});

		requestAnimationFrame(async () => {
			const { AssetsDetectionController, AccountTrackerController } = Engine.context;
			AssetsDetectionController.detectAssets();
			// AccountTrackerController.refresh();
			this.getBalance()
			this.getWalletInfo();
			this.mounted = true;
		});
		this.getCurrentConversion()
		//this.initSocket();
	};

	async getWalletInfo() {
		const { selectedAddress } = this.props;
		const { PreferencesController } = Engine.context;

		API.postRequest(Routes.walletInfo, [
			selectedAddress
		], response => {
			if (response.result) {
				const name = response.result;
				PreferencesController.setAccountLabel(selectedAddress, name);
			}
		}, error => {
			console.warn('error wallet info', error)
		})
	}

	getCurrentConversion = () => {
		API.getRequest(Routes.getConversions, response => {
			if (response.data.length > 0) {
				this.setState({
					currentConversion: response.data[0].to
				})
			}
		}, error => {
			console.log(error)
		})
	}

	onRefresh = async () => {
		requestAnimationFrame(async () => {
			this.setState({ refreshing: true });
			const {
				AssetsDetectionController,
				AccountTrackerController,
				CurrencyRateController,
				TokenRatesController
			} = Engine.context;
			const actions = [
				AssetsDetectionController.detectAssets(),
				AccountTrackerController.refresh(),
				CurrencyRateController.start(),
				TokenRatesController.poll()
			];
			await Promise.all(actions);
			this.setState({ refreshing: false });
		});
	};

	getBalance = async () => {
		const { accounts, selectedAddress, identities } = this.props;
		// for(const account in accounts){
		let params = [selectedAddress]
		await API.postRequest(Routes.getBalance, params, response => {
			// console.log(parseInt(response.result, 16))
			const balance = response.result
			accounts[selectedAddress] = {
				balance: balance,
				conversion: this.state.currentConversion
			}
			const { AccountTrackerController } = Engine.context;
			AccountTrackerController.update({ accounts: Object.assign({}, accounts) })
		}, error => {
			console.log(error.message)
		})
		// }
	};

	componentWillUnmount() {
		this.mounted = false;
	}

	renderTabBar() {
		return (
			<DefaultTabBar
				underlineStyle={styles.tabUnderlineStyle}
				activeTextColor={colors.blue}
				inactiveTextColor={colors.fontTertiary}
				backgroundColor={colors.white}
				tabStyle={styles.tabStyle}
				textStyle={styles.textStyle}
			/>
		);
	}

	onChangeTab = obj => {
		InteractionManager.runAfterInteractions(() => {
			if (obj.ref.props.tabLabel === strings('wallet.tokens')) {
				Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_TOKENS);
			} else {
				Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_COLLECTIBLES);
			}
		});
	};

	onRef = ref => {
		this.accountOverviewRef = ref;
	};

	renderContent() {
		const {
			accounts,
			conversionRate,
			currentCurrency,
			identities,
			selectedAddress,
			tokens,
			collectibles,
			navigation,
			ticker
		} = this.props;

		const { currentConversion } = this.state;

		let balance = 0;
		let assets = tokens;
		if (selectedAddress && accounts) {
			balance = accounts[selectedAddress].balance
			// balance = "0x00"
			assets = [
				{
					name: 'Liquichain',
					symbol: getTicker(ticker),
					isETH: true,
					balance,
					balanceFiat: weiToFiat(hexToBN(balance), currentConversion?.value, currentConversion?.currency),
					logo: '../images/logo.png'
				},
				...tokens
			];
		} else {
			assets = tokens;
		}

		console.log({
			accounts
		})


		const account = { address: selectedAddress, ...identities[selectedAddress], ...accounts[selectedAddress] };

		return (
			<View style={styles.wrapper}>
				{
					(selectedAddress && account) && (
						<AccountOverview account={account} navigation={navigation} onRef={this.onRef} />
					)
				}
				<View>
					<TextInput
						multiline={true}
						numberOfLines={4}
						value={this.state.webrtcMessage}
						onChangeText={text => {
							this.setState({ webrtcMessage: text });
							if (this.webrtc) {
								Object.keys(this.webrtc.sendChannels)
									.forEach(peer => this.webrtc.sendToPeer(peer, text));
							}
						}}
						style={{
							height: 100,
							marginVertical: 10,
							paddingHorizontal: 10,
							marginHorizontal: 20,
							borderRadius: 4,
							borderColor: this.state.webrtcConnected ? colors.blue : colors.grey400,
							borderWidth: this.state.webrtcConnected ? 2 : StyleSheet.hairlineWidth,
						}}
					/>
					<StyledButton
						type={'confirm'}
						containerStyle={{ marginHorizontal: 20 }}
						onPress={this.connectWebRTC}
					>
						{'WebRTC'}
					</StyledButton>
				</View>
				<ScrollableTabView
					renderTabBar={this.renderTabBar}
					// eslint-disable-next-line react/jsx-no-bind
					onChangeTab={obj => this.onChangeTab(obj)}
				>
					<Tokens navigation={navigation} tabLabel={'LCN Tokens/Apps'} tokens={assets} />
					{/*<CollectibleContracts
						navigation={navigation}
						tabLabel={strings('wallet.collectibles')}
						collectibles={collectibles}
					/>*/}
				</ScrollableTabView>
			</View>
		);
	}

	initSocket = () => {
		// Step 1: Connect with the Signal server
		this.socketRef = io('http://192.168.0.187:9000', {
			reconnectionDelayMax: 10000,
			query: { auth: 'getinvolved' },
		});
		; // Address of the Signal server

		this.socketRef.on("connected", this.handleConnected);

		this.socketRef.on("offer", this.handleOffer);

		this.socketRef.on("answer", this.handleAnswer);

		this.socketRef.on("ice-candidate", this.handleNewICECandidateMsg);
	}

	handleConnected = () => {
		const { selectedAddress } = this.props;
		this.socketRef.emit('join', selectedAddress)
	}

	handleOffer = (incoming) => {
		/*
			Here we are exchanging config information
			between the peers to establish communication
		*/
		console.log("[INFO] Handling Offer")
		this.otherUserId = incoming.caller;
		this.peerRef = this.Peer(incoming.caller);
		this.peerRef.ondatachannel = (event) => {
			this.sendChannel = event.channel;
			this.sendChannel.onmessage = this.handleReceiveMessage;
			console.log('[SUCCESS] Connection established')
			this.setState({ webrtcConnected: true });
		}

		/*
			Session Description: It is the config information of the peer
			SDP stands for Session Description Protocol. The exchange
			of config information between the peers happens using this protocol
		*/
		const desc = new RTCSessionDescription(incoming.sdp);

		/* 
			 Remote Description : Information about the other peer
			 Local Description: Information about you 'current peer'
		*/

		const { selectedAddress } = this.props;
		this.peerRef.setRemoteDescription(desc).then(() => {
		}).then(() => {
			return this.peerRef.createAnswer();
		}).then(answer => {
			return this.peerRef.setLocalDescription(answer);
		}).then(() => {
			const payload = {
				target: incoming.caller,
				caller: selectedAddress,
				sdp: this.peerRef.localDescription
			}
			this.socketRef.emit("answer", payload);
		})
	}

	handleAnswer = (message) => {
		// Handle answer by the receiving peer
		const desc = new RTCSessionDescription(message.sdp);
		this.peerRef.setRemoteDescription(desc).catch(e => console.log("Error handle answer", e));
		this.setState({ webrtcConnected: true });
	}

	handleReceiveMessage = (e) => {
		// Listener for receiving messages from the peer
		console.log("[INFO] Message received from peer", e.data);
		this.setState({ webrtcMessage: e.data });
	};

	handleNewICECandidateMsg = (incoming) => {
		const candidate = new RTCIceCandidate(incoming);

		this.peerRef.addIceCandidate(candidate)
			.catch(e => console.log(e));
	}


	Peer = (userID) => {
		/* 
			 Here we are using Turn and Stun server
		*/
		const peer = new RTCPeerConnection({
			iceServers: [
				{
					urls: "stun:stun.stunprotocol.org"
				},
				{
					urls: 'turn:numb.viagenie.ca',
					credential: 'long3232',
					username: 'dragons3232@gmail.com'
				},
			]
		});
		peer.onicecandidate = this.handleICECandidateEvent;
		peer.onnegotiationneeded = () => this.handleNegotiationNeededEvent(userID);
		return peer;
	}

	handleICECandidateEvent = (e) => {
		/*
			ICE stands for Interactive Connectivity Establishment. Using this
			peers exchange information over the intenet. When establishing a
			connection between the peers, peers generally look for several 
			ICE candidates and then decide which to choose best among possible
			candidates
		*/
		if (e.candidate) {
			const payload = {
				target: this.otherUserId,
				candidate: e.candidate,
			}
			this.socketRef.emit("ice-candidate", payload);
		}
	}

	handleNegotiationNeededEvent = (userID) => {
		const { selectedAddress } = this.props;

		// Offer made by the initiating peer to the receiving peer.
		this.peerRef.createOffer().then(offer => {
			return this.peerRef.setLocalDescription(offer);
		})
			.then(() => {
				const payload = {
					target: userID,
					caller: selectedAddress,
					sdp: this.peerRef.localDescription,
				};
				this.socketRef.emit("offer", payload);
			})
			.catch(err => console.log("Error handling negotiation needed event", err));
	}

	connectWebRTC = () => {
		this.props.navigation.navigate('Contacts', {
			contactSelection: true,
			onConfirm: (contacts) => {
				// this.connectToUser(contacts[0].address);
				this.webrtc.connectTo(contacts[0].address);
			}
		})
	}

	connectToUser(userID) {
		this.otherUserId = userID;
		// This will initiate the call for the receiving peer
		console.log("[INFO] Initiated a call")
		this.peerRef = this.Peer(userID);
		this.sendChannel = this.peerRef.createDataChannel('sendChannel');

		// listen to incoming messages from other peer
		this.sendChannel.onmessage = this.handleReceiveMessage;
	}

	renderLoader() {
		return (
			<View style={styles.loader}>
				<ActivityIndicator size="small" />
			</View>
		);
	}

	/**
	 * Return current step of onboarding wizard if not step 5 nor 0
	 */
	renderOnboardingWizard = () => {
		const { wizardStep } = this.props;
		return (
			[1, 2, 3, 4].includes(wizardStep) && (
				<OnboardingWizard navigation={this.props.navigation} coachmarkRef={this.accountOverviewRef} />
			)
		);
	};

	render = () => (
		<ErrorBoundary view="Wallet">
			<View style={baseStyles.flexGrow} testID={'wallet-screen'}>
				<ScrollView
					style={styles.wrapper}
					refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.getBalance} />}
				>
					{(this.props.selectedAddress && this.props.accounts) ? this.renderContent() : this.renderLoader()}
				</ScrollView>
				{this.renderOnboardingWizard()}
			</View>
		</ErrorBoundary>
	);
}

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	identities: state.engine.backgroundState.PreferencesController.identities,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	tokens: state.engine.backgroundState.AssetsController.tokens,
	collectibles: state.engine.backgroundState.AssetsController.collectibles,
	ticker: state.engine.backgroundState.NetworkController.provider.ticker,
	wizardStep: state.wizard.step
});

const mapDispatchToProps = dispatch => ({
	showTransactionNotification: args => dispatch(showTransactionNotification(args)),
	hideCurrentNotification: () => dispatch(hideCurrentNotification())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Wallet);
