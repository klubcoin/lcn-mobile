import { makeObservable, observable, observe } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react';
import {
	View,
	Text,
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Image,
	TextInput
} from 'react-native';
import { strings } from '../../../../../locales/i18n';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import APIService from '../../../../services/APIService';
import NavbarTitle from '../../../UI/NavbarTitle';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import StyledButton from '../../../UI/StyledButton';
import ModalSelector from '../../../UI/AddCustomTokenOrApp/ModalSelector';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import ConfirmModal from '../../../UI/ConfirmModal';
import ConfirmInputModal from '../../../UI/ConfirmInputModal';
import ImagePicker from 'react-native-image-crop-picker';
import { v4 as uuid } from 'uuid';
import styles from './styles';
import drawables from '../../../../common/drawables';
import store from '../store';
import Engine from '../../../../core/Engine';
import CryptoSignature from '../../../../core/CryptoSignature';
import AssetIcon from '../../../UI/AssetIcon';
import routes from '../../../../common/routes';
import NetworkMainAssetLogo from '../../../UI/NetworkMainAssetLogo';
import { showError, showSuccess } from '../../../../util/notify';
import { Rating } from 'react-native-ratings';
import { RFValue } from 'react-native-responsive-fontsize';

const fakeReviews = [
	{
		user: 'John Henry',
		ratingScore: 4.5,
		productName: 'Liqui products',
		review:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	},
	{
		user: 'Tom Carter',
		ratingScore: 4.2,
		productName: 'Vacuum cleaner',
		review:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	},
	{
		user: 'John Wick',
		ratingScore: 3.5,
		productName: 'Mobile phone',
		review:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	},
	{
		user: 'Thomas Shelby',
		ratingScore: 5.0,
		productName: 'Car',
		review:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	},
	{
		user: 'Tom Carter',
		ratingScore: 3.3,
		productName: 'Bicycle',
		review:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	},
	{
		user: 'Scar Hilton',
		ratingScore: 3.8,
		productName: 'superlonggggggggggggggggggggggggggggggggggggggggggggggggggggggggggname',
		review:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	},
	{
		user: 'Michael Edison',
		ratingScore: 4.5,
		productName: 'Birthday gifts',
		review:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
	}
];

export class MarketStoreReviews extends PureComponent {
	static navigationOptions = () => ({ header: null });

	constructor(props) {
		super(props);
	}

	toggleDrawer = () => {
		this.props.navigation.toggleDrawer();
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.toggleDrawer.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'bars'} size={RFValue(15)} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>Store Reviews</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	renderOverview() {
		return (
			<View style={styles.overviewContainer}>
				<Text style={styles.ratingScore}>4.5</Text>
				<View style={styles.ratingContainer}>
					<Rating readonly style={styles.ratings} fractions={1} imageSize={25} startingValue={4.5} />
					<Text style={styles.totalReview}>From {fakeReviews.length} users</Text>
				</View>
			</View>
		);
	}

	renderReviews() {
		return (
			<SafeAreaView style={{ flex: 1 }}>
				<ScrollView style={styles.reviewsBody}>
					{fakeReviews.map(e => (
						<View style={styles.reviewItem}>
							<Text style={styles.userName} numberOfLines={1} ellipsizeMode={'middle'}>
								{e.user}
								<Text style={styles.scoreReviewItem}> ({e.ratingScore}) </Text>
							</Text>
							<Rating
								readonly
								style={styles.ratingReviewItem}
								fractions={1}
								imageSize={16}
								startingValue={e.ratingScore}
							/>
							<Text style={styles.productName} numberOfLines={1} ellipsizeMode={'middle'}>
								{strings('market.purchased')}: {e.productName}
							</Text>
							<Text style={styles.reviewText}>{e.review}</Text>
						</View>
					))}
				</ScrollView>
			</SafeAreaView>
		);
	}

	render() {
		return (
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'} enabled={Device.isIos()}>
				<View style={styles.wrapper}>
					{this.renderNavBar()}
					<View style={styles.body}>
						{this.renderOverview()}
						{this.renderReviews()}
					</View>
				</View>
			</KeyboardAvoidingView>
		);
	}
}

export default inject('store')(observer(MarketStoreReviews));
