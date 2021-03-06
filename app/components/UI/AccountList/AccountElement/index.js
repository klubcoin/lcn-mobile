import React, { PureComponent } from 'react';
import Identicon from '../../Identicon';
import PropTypes from 'prop-types';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import { hexToBN, fromWei } from '../../../../util/number';
import { getTicker } from '../../../../util/transactions';
import { strings } from '../../../../../locales/i18n';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import RemoteImage from '../../../Base/RemoteImage';
import EthereumAddress from '../../../UI/EthereumAddress';
import { RFValue } from 'react-native-responsive-fontsize';

const EMPTY = '0x0';
const BALANCE_KEY = 'balance';

const styles = StyleSheet.create({
	account: {
		backgroundColor: colors.purple500,
		marginVertical: 10,
		borderRadius: 12,
		flexDirection: 'row',
		paddingHorizontal: 20,
		paddingVertical: 20
	},
	disabledAccount: {
		opacity: 0.5
	},
	accountInfo: {
		marginLeft: 15,
		marginRight: 0,
		flex: 1,
		flexDirection: 'row'
	},
	accountLabel: {
		fontSize: 20,
		fontWeight: '700',
		color: colors.fontPrimary,
		...fontStyles.normal
	},
	accountBalanceWrapper: {
		display: 'flex',
		flexDirection: 'row'
	},
	accountBalance: {
		paddingTop: 5,
		fontSize: 12,
		color: colors.fontSecondary,
		textAlign: 'center',
		...fontStyles.normal
	},
	accountBalanceError: {
		color: colors.fontError,
		marginLeft: 4
	},
	importedView: {
		flex: 0.5,
		alignItems: 'center',
		marginTop: 2
	},
	accountMain: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center'
	},
	selectedWrapper: {
		flex: 0.2,
		alignItems: 'flex-end',
		justifyContent: 'center'
	},
	importedText: {
		color: colors.grey400,
		fontSize: 10,
		...fontStyles.bold
	},
	importedWrapper: {
		width: 73,
		paddingHorizontal: 10,
		paddingVertical: 3,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: colors.grey400
	},
	avatar: {
		width: 46,
		height: 46,
		borderRadius: 23
	},
	address: {
		color: colors.white,
		fontSize: RFValue(11)
	}
});

/**
 * View that renders specific account element in AccountList
 */
class AccountElement extends PureComponent {
	static propTypes = {
		/**
		 * Callback to be called onPress
		 */
		onPress: PropTypes.func.isRequired,
		/**
		 * Callback to be called onLongPress
		 */
		onLongPress: PropTypes.func.isRequired,
		/**
		 * Current ticker
		 */
		ticker: PropTypes.string,
		/**
		 * Whether the account element should be disabled (opaque and not clickable)
		 */
		disabled: PropTypes.bool,
		item: PropTypes.object,
		/**
		 * Updated balance using stored in state
		 */
		updatedBalanceFromStore: PropTypes.string
	};

	onPress = () => {
		const { onPress } = this.props;
		const { index } = this.props.item;
		onPress && onPress(index);
	};

	onLongPress = () => {
		const { onLongPress } = this.props;
		const { address, isImported, index } = this.props.item;
		onLongPress && onLongPress(address, isImported, index);
	};

	render() {
		const { disabled, updatedBalanceFromStore, onboardProfile } = this.props;
		const { address, name, isSelected, isImported, balanceError } = this.props.item;
		const { ticker } = this.props;
		const selected = isSelected ? <Icon name="check-circle" size={30} color={colors.blue} /> : null;
		const imported = isImported ? (
			<View style={styles.importedWrapper}>
				<Text numberOfLines={1} style={styles.importedText}>
					{strings('accounts.imported')}
				</Text>
			</View>
		) : null;
		const { avatar } = onboardProfile || {};

		return (
			<View onStartShouldSetResponder={() => true}>
				<TouchableOpacity
					style={[styles.account, disabled ? styles.disabledAccount : null]}
					key={`account-${address}`}
					onPress={this.onPress}
					onLongPress={this.onLongPress}
					disabled={disabled}
					activeOpacity={0.7}
				>
					{!!avatar ? (
						<RemoteImage source={{ uri: `file://${avatar}` }} style={styles.avatar} />
					) : (
						<Identicon address={address} diameter={38} />
					)}
					<View style={styles.accountInfo}>
						<View style={styles.accountMain}>
							<Text numberOfLines={1} style={[styles.accountLabel]}>
								{name?.name ?? `${name}`}
							</Text>
							{address && <EthereumAddress address={address} style={styles.address} type={'short'} />}
							<View style={styles.accountBalanceWrapper}>
								<Text style={styles.accountBalance}>
									{fromWei(hexToBN(updatedBalanceFromStore))} {getTicker(ticker)}
								</Text>
								{!!balanceError && (
									<Text style={[styles.accountBalance, styles.accountBalanceError]}>
										{balanceError}
									</Text>
								)}
							</View>
						</View>
						{!!imported && <View style={styles.importedView}>{imported}</View>}
						<View style={styles.selectedWrapper}>{selected}</View>
					</View>
				</TouchableOpacity>
			</View>
		);
	}
}

const mapStateToProps = (
	{
		engine: {
			backgroundState: { PreferencesController, AccountTrackerController }
		},
		user: { onboardProfile }
	},
	{ item: { balance, address } }
) => {
	const { selectedAddress } = PreferencesController;
	const { accounts } = AccountTrackerController;
	const selectedAccount = accounts[selectedAddress];
	const selectedAccountHasBalance =
		selectedAccount && Object.prototype.hasOwnProperty.call(selectedAccount, BALANCE_KEY);
	const updatedBalanceFromStore =
		balance === EMPTY && selectedAddress === address && selectedAccount && selectedAccountHasBalance
			? selectedAccount[BALANCE_KEY]
			: balance;
	return {
		updatedBalanceFromStore,
		onboardProfile
	};
};

export default connect(mapStateToProps)(AccountElement);
