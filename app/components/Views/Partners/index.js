import React, { PureComponent } from 'react';
import { StyleSheet, TouchableOpacity, View, Image, ScrollView } from 'react-native';
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
import FileTransferWebRTC from '../../../services/FileTransferWebRTC';
import { ConfirmProfileRequest } from '../../../services/Messages';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import PartnerItem from './components/PartnerItem';

const assetPath = '../../../images';
const logos = [
	require(`${assetPath}/logo_liquichain.png`),
	require(`${assetPath}/logo_djenerates.png`),
	require(`${assetPath}/logo_clubbingtv.png`),
	require(`${assetPath}/logo_atlanticus.png`),
	require(`${assetPath}/logo_amnesia_Ibiza.png`)
];

class Partners extends PureComponent {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle(strings('drawer.partners'), navigation);

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<ScrollView>
					{logos.map(e => (
						<PartnerItem imageSrc={e} />
					))}
				</ScrollView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(Partners));
