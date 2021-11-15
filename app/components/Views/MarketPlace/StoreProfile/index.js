import React, { PureComponent } from 'react';
import {
	KeyboardAvoidingView,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
	Image,
	Text,
	SafeAreaView,
	Dimensions
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import preferences from '../../../../store/preferences';
import { getOnboardingNavbarOptions } from '../../../UI/Navbar';
import RemoteImage from '../../../Base/RemoteImage';
import drawables from '../../../../common/drawables';
import * as RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import { colors, fontStyles } from '../../../../styles/common';
import OnboardingProgress from '../../../UI/OnboardingProgress';
import { CHOOSE_PASSWORD_STEPS } from '../../../../constants/onboarding';
import { ONBOARDING, PREVIOUS_SCREEN } from '../../../../constants/navigation';
import StyledButton from '../../../UI/StyledButton';
import { strings } from '../../../../../locales/i18n';
import { TextInput } from 'react-native-gesture-handler';
import Device from '../../../../util/Device';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import styles from './styles/index';

const shopInfo = {
	desc:
		'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.'
};

class StoreProfile extends PureComponent {
	toggleDrawer = () => {
		this.props.navigation.toggleDrawer();
	};

	onEdit = () => {
		this.props.navigation.navigate('EditStoreProfile');
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.toggleDrawer.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'bars'} size={RFValue(15)} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.store_profile')}</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	render() {
		return (
			<KeyboardAvoidingView style={styles.container} behavior={'padding'} enabled={Device.isIos()}>
				{this.renderNavBar()}
				<View style={styles.topBody} />
				<View>
					<ScrollView>
						<View style={styles.body}>
							<TouchableOpacity onPress={this.onEdit} style={styles.editIcon}>
								<Icon name={'edit'} size={RFPercentage(2)} />
							</TouchableOpacity>
							<Text style={styles.storeName}>DEV SHOP</Text>
							<View style={styles.content}>
								<Text style={styles.header}>About</Text>
								<Text style={styles.desc}>{shopInfo.desc}</Text>
								<Text style={styles.header}>Contacts</Text>
								<Text style={styles.contact}>Phone: 01235689</Text>
								<Text style={styles.contact}>Email: liqui@gmail.com</Text>
							</View>
						</View>
					</ScrollView>
					<Image
						source={{ uri: 'https://i.pinimg.com/736x/f6/d0/af/f6d0af482a5a1116dbbd2fd3ff95e58c.jpg' }}
						style={styles.logo}
						resizeMode={'cover'}
					/>
				</View>
			</KeyboardAvoidingView>
		);
	}
}

export default inject('store')(observer(StoreProfile));
