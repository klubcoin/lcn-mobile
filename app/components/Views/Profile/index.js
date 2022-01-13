import React, { PureComponent } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import * as RNFS from 'react-native-fs';
import preferences from '../../../store/preferences';
import { strings } from '../../../../locales/i18n';
import Engine from '../../../core/Engine';
import routes from '../../../common/routes';
import { refWebRTC } from '../../../services/WebRTC';
import Identicon from '../../UI/Identicon';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import RemoteImage from '../../../components/Base/RemoteImage';
import Text from '../../../components/Base/Text';
import ImagePicker from 'react-native-image-crop-picker';
import { colors } from '../../../styles/common';
import AccountList from '../../UI/AccountList';
import StyledButton from '../../UI/StyledButton';
import FileTransferWebRTC from '../FilesManager/store/FileTransferWebRTC';
import { ConfirmProfileRequest } from '../../../services/Messages';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import CryptoSignature from '../../../core/CryptoSignature';

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	body: {
		alignItems: 'center',
		marginTop: 80
	},
	avatarView: {
		borderRadius: 96,
		borderWidth: 2,
		padding: 2,
		borderColor: colors.blue
	},
	avatar: {
		width: 96,
		height: 96,
		borderRadius: 48,
		overflow: 'hidden',
		alignSelf: 'center'
	},
	name: {
		marginTop: 10,
		fontSize: 24,
		fontWeight: '600',
		color: colors.fontPrimary
	},
	email: {
		fontSize: 18,
		fontWeight: '600',
		color: colors.fontPrimary
	},
	accounts: {
		marginTop: 30,
		width: '100%'
	},
	actions: {
		flexDirection: 'column',
		width: 300,
		marginTop: 20
	}
});

class Profile extends PureComponent {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle(strings('drawer.profile'), navigation);

	account = {};
	onboardProfile = {};
	selectedAddress = '';

	constructor(props) {
		super(props);
		makeObservable(this, {
			account: observable,
			onboardProfile: observable,
			selectedAddress: observable
		});

		const { selectedAddress } = Engine.state.PreferencesController;
		this.selectedAddress = selectedAddress;
	}

	componentDidMount() {
		this.fetchUser();
	}

	async fetchUser() {
		this.account = await preferences.getKeycloakAccount();
		this.onboardProfile = await preferences.getOnboardProfile();
	}

	onPickImage() {
		return; //TODO: editable is not available now
		/*
		ImagePicker.openCamera({
			width: 300,
			height: 300,
			cropping: true
		}).then(image => {
			this.account.avatar = image.path;
		});
		*/
	}

	sendConfirmationRequests = async contacts => {
		const webrtc = refWebRTC();
		const { PreferencesController } = Engine.state;
		const { selectedAddress } = PreferencesController;
		const { blockedIdentityReqPeers } = this.props.store;

		const addresses = contacts.filter(e => !blockedIdentityReqPeers[e.address]).map(e => e.address);
		if (addresses.length == 0) {
			return;
		}

		const { email } = this.account || {};
		const { avatar, firstname, lastname } = this.onboardProfile || {};
		const image = await RNFS.readFile(avatar, 'base64');

		const request = ConfirmProfileRequest(selectedAddress, firstname, lastname, image, email);
		FileTransferWebRTC.sendAsOne(request, selectedAddress, addresses, webrtc);
	};

	onRequest() {
		this.props.navigation.navigate('Contacts', {
			contactSelection: true,
			onConfirm: this.sendConfirmationRequests
		});
	}

	onChangeShippingInfo() {
		this.props.navigation.navigate('ShippingInfo');
	}

	render() {
		const { email, name } = this.account ?? {};
		const { avatar, lastname, firstname } = this.onboardProfile ?? {};
		const { identities } = Engine.state.PreferencesController;

		return (
			<OnboardingScreenWithBg screen="a">
				<View style={styles.container}>
					<View style={styles.body}>
						<TouchableOpacity activeOpacity={0.5} style={styles.avatarView} onPress={() => this.onPickImage()}>
							{avatar ? (
								<RemoteImage source={{ uri: `file://${avatar}` }} style={styles.avatar} />
							) : (
								<Identicon diameter={96} address={this.selectedAddress} />
							)}
						</TouchableOpacity>
						<Text style={styles.name}>{name ?? firstname + ' ' + lastname}</Text>
						<Text style={styles.email}>{email}</Text>
						<View style={styles.actions}>
							<StyledButton type={'normal'} onPress={this.onRequest.bind(this)}>
								{strings('profile.request_profile_confirmation')}
							</StyledButton>
							<StyledButton type={'normal'} onPress={this.onChangeShippingInfo.bind(this)} containerStyle={{ marginTop: 10 }}>
								{strings('profile.change_shipping_info')}
							</StyledButton>
						</View>
						<View style={styles.accounts}>
							<AccountList
								navigation={this.props.navigation}
								enableAccountsAddition={false}
								enableRestoreAccount={true}
								identities={identities}
								selectedAddress={this.selectedAddress}
								ticker={routes.mainNetWork.ticker}
							/>
						</View>
					</View>
				</View>
			</OnboardingScreenWithBg>

		);
	}
}

export default inject('store')(observer(Profile));
