import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Identicon from '../Identicon';
import { toggleAccountsModal } from '../../../actions/modals';
import Device from '../../../util/Device';
import RemoteImage from '../../Base/RemoteImage';

const styles = StyleSheet.create({
	leftButton: {
		marginTop: 12,
		marginRight: Device.isAndroid() ? 7 : 18,
		marginLeft: Device.isAndroid() ? 7 : 0,
		marginBottom: 12,
		alignItems: 'center',
		justifyContent: 'center'
	},
	avatar: {
		width: 28,
		height: 28,
		borderRadius: 24
	},
});

/**
 * UI PureComponent that renders on the top right of the navbar
 * showing an identicon for the selectedAddress
 */
class AccountRightButton extends PureComponent {
	static propTypes = {
		/**
		 * Selected address as string
		 */
		address: PropTypes.string,
		/**
		 * Action that toggles the account modal
		 */
		toggleAccountsModal: PropTypes.func
	};

	animating = false;
	date = new Date()

	toggleAccountsModal = () => {
		if (!this.animating) {
			this.animating = true;
			this.props.toggleAccountsModal();
			setTimeout(() => {
				this.animating = false;
			}, 500);
		}
	};

	render = () => {
		const { address, onboardProfile } = this.props;
		const { avatar } = onboardProfile || {};

		return (
			<TouchableOpacity
				style={styles.leftButton}
				onPress={this.toggleAccountsModal}
				testID={'navbar-account-button'}
			>
				{!!avatar ? (
					<RemoteImage
						source={{ uri: `file://${avatar}?v=${this.date.getTime()}` }}
						style={styles.avatar}
					/>
				) : (
					<Identicon diameter={28} address={address} />
				)}

			</TouchableOpacity>
		);
	};
}


const mapStateToProps = state => ({
	address: state.engine.backgroundState.PreferencesController.selectedAddress,
	onboardProfile: state.user.onboardProfile
});

const mapDispatchToProps = dispatch => ({
	toggleAccountsModal: () => dispatch(toggleAccountsModal())
});
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AccountRightButton);
