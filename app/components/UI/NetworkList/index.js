import React, { PureComponent } from 'react';
import Engine from '../../../core/Engine';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import { InteractionManager, ScrollView, TouchableOpacity, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import Networks, { getAllNetworks, isSafeChainId } from '../../../util/networks';
import { connect } from 'react-redux';
import AnalyticsV2 from '../../../util/analyticsV2';
import { MAINNET, RPC } from '../../../constants/network';
import styles from './styles/index';
import StyledButton from '../StyledButton';
import routes from '../../../common/routes';

/**
 * View that contains the list of all the available networks
 */
export class NetworkList extends PureComponent {
	static propTypes = {
		/**
		 * An function to handle the close event
		 */
		onClose: PropTypes.func,
		/**
		 * A list of custom RPCs to provide the user
		 */
		frequentRpcList: PropTypes.array,
		/**
		 * NetworkController povider object
		 */
		provider: PropTypes.object,
		/**
		 * Indicates whether third party API mode is enabled
		 */
		thirdPartyApiMode: PropTypes.bool,
		/**
		 * Show invalid custom network alert for networks without a chain ID
		 */
		showInvalidCustomNetworkAlert: PropTypes.func
	};

	getOtherNetworks = () => getAllNetworks().slice(1);

	hexToRGB = (hex, alpha) => {
		var r = parseInt(hex.slice(1, 3), 16),
			g = parseInt(hex.slice(3, 5), 16),
			b = parseInt(hex.slice(5, 7), 16);

		if (alpha) {
			return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
		} else {
			return 'rgb(' + r + ', ' + g + ', ' + b + ')';
		}
	};

	onNetworkChange = type => {
		requestAnimationFrame(() => {
			this.props.onClose(false);
			InteractionManager.runAfterInteractions(() => {
				const { NetworkController, CurrencyRateController } = Engine.context;
				CurrencyRateController.setNativeCurrency('ETH');
				NetworkController.setProviderType(type);
				this.props.thirdPartyApiMode &&
					setTimeout(() => {
						Engine.refreshTransactionHistory();
					}, 1000);

				AnalyticsV2.trackEvent(AnalyticsV2.ANALYTICS_EVENTS.NETWORK_SWITCHED, {
					network_name: type,
					chain_id: String(Networks[type].chainId),
					source: 'Settings'
				});
			});
		});
	};

	closeModal = () => {
		this.props.onClose(true);
	};

	onSetRpcTarget = async rpcTarget => {
		const { frequentRpcList } = this.props;
		const { NetworkController, CurrencyRateController } = Engine.context;
		const rpc = frequentRpcList.find(({ rpcUrl }) => rpcUrl === rpcTarget);
		const {
			rpcUrl,
			chainId,
			ticker,
			nickname,
			rpcPrefs: { blockExplorerUrl }
		} = rpc;

		// If the network does not have chainId then show invalid custom network alert
		const chainIdNumber = parseInt(chainId, 10);
		if (!isSafeChainId(chainIdNumber)) {
			this.props.onClose(false);
			this.props.showInvalidCustomNetworkAlert(rpcTarget);
			return;
		}

		CurrencyRateController.setNativeCurrency(ticker);
		NetworkController.setRpcTarget(rpcUrl, chainId, ticker, nickname);

		AnalyticsV2.trackEvent(AnalyticsV2.ANALYTICS_EVENTS.NETWORK_SWITCHED, {
			rpc_url: rpcUrl,
			chain_id: chainId,
			source: 'Settings',
			symbol: ticker,
			block_explorer_url: blockExplorerUrl,
			network_name: 'rpc'
		});

		this.props.onClose(false);
	};

	networkElement = (selected, onPress, name, color, i, network) => (
		<TouchableOpacity
			style={[styles.network, color ? { backgroundColor: this.hexToRGB(color, 0.2) } : styles.otherNetworkIcon]}
			key={`network-${i}`}
			onPress={() => onPress(network)} // eslint-disable-line
		>
			<View style={[styles.networkIcon, color ? { backgroundColor: color } : styles.otherNetworkIcon]} />
			<View style={styles.networkInfo}>
				<Text style={styles.networkLabel}>{name}</Text>
			</View>
			<View style={styles.selected}>{selected}</View>
		</TouchableOpacity>
	);

	renderOtherNetworks = () => {
		const { provider } = this.props;
		return this.getOtherNetworks().map((network, i) => {
			const { color, name } = Networks[network];
			const selected = provider.type === network ? <Icon name="check" size={20} color={color} /> : null;
			return this.networkElement(selected, this.onNetworkChange, name, color, i, network);
		});
	};

	renderRpcNetworks = () => {
		const { frequentRpcList, provider } = this.props;
		return frequentRpcList.map(({ nickname, rpcUrl }, i) => {
			const { color, name } = { name: nickname || rpcUrl, color: null };
			const selected =
				provider.rpcTarget === rpcUrl && provider.type === RPC ? (
					<Icon name="check" size={20} color={colors.fontSecondary} />
				) : null;
			return this.networkElement(selected, this.onSetRpcTarget, name, color, i, rpcUrl);
		});
	};

	renderMainnet() {
		const { provider } = this.props;
		const { color: mainnetColor, name: mainnetName } = Networks.mainnet;
		const isMainnet =
			provider.type === MAINNET || (provider.type == RPC && provider.chainId == routes.mainNetWork.chainId) ? (
				<Icon name="check" size={15} color={mainnetColor} />
			) : null;

		return (
			<View style={styles.mainnetHeader}>
				<TouchableOpacity
					style={[styles.network, styles.mainnet, { backgroundColor: this.hexToRGB(mainnetColor, 0.2) }]}
					key={`network-mainnet`}
					onPress={() => this.onNetworkChange(MAINNET)} // eslint-disable-line
					testID={'network-name'}
				>
					<View style={styles.networkWrapper}>
						<View style={[styles.networkIcon, { backgroundColor: mainnetColor }]} />
						<View style={styles.networkInfo}>
							<Text style={styles.networkLabel}>{mainnetName}</Text>
						</View>
						<View style={[styles.selected, styles.mainnetSelected]}>{isMainnet}</View>
					</View>
				</TouchableOpacity>
			</View>
		);
	}

	render = () => (
		<SafeAreaView style={styles.wrapper} testID={'networks-list'}>
			<View style={styles.titleWrapper}>
				<Text testID={'networks-list-title'} style={styles.title} onPress={this.closeSideBar}>
					{strings('networks.title')}
				</Text>
			</View>
			<ScrollView style={styles.networksWrapper} testID={'other-networks-scroll'}>
				{this.renderMainnet()}

				{/* <View style={styles.otherNetworksHeader}>
					<Text style={styles.otherNetworksText} testID={'other-network-name'}>
						{strings('networks.other_networks')}
					</Text>
				</View>
				{this.renderOtherNetworks()}
				{this.renderRpcNetworks()} */}
			</ScrollView>
			<View style={styles.footer}>
				<StyledButton containerStyle={styles.footerButton} type={'normal'} onPress={this.closeModal}>
					<Text style={styles.closeButton}>{strings('networks.close').toUpperCase()}</Text>
				</StyledButton>
				{/* <TouchableOpacity style={styles.footerButton} onPress={this.closeModal}>
					<Text style={styles.closeButton}>{strings('networks.close')}</Text>
				</TouchableOpacity> */}
			</View>
		</SafeAreaView>
	);
}

const mapStateToProps = state => ({
	provider: state.engine.backgroundState.NetworkController.provider,
	frequentRpcList: state.engine.backgroundState.PreferencesController.frequentRpcList,
	thirdPartyApiMode: state.privacy.thirdPartyApiMode
});

export default connect(mapStateToProps)(NetworkList);
