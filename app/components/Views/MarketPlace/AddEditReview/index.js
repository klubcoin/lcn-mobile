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

export class MarketAddEditReview extends PureComponent {
	static navigationOptions = () => ({ header: null });

	maxRatingScore = 5;
	ratingScore = 2.5;

	constructor(props) {
		super(props);
		makeObservable(this, {
			ratingScore: observable
		});
	}

	componentDidMount() {}

	onBack = () => {
		this.props.navigation.goBack();
	};

	onSave() {}

	onCancel() {
		this.onBack();
	}

	onRating = value => {
		this.ratingScore = value;
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
						<Icon name={'arrow-left'} size={16} style={styles.backIcon} />
					</TouchableOpacity>
					<NavbarTitle title={'market.add_review'} disableNetwork />
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	render() {
		const editing = !!this.uuid;

		return (
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'} enabled={Device.isIos()}>
				{this.renderNavBar()}
				<ScrollView contentContainerStyle={styles.wrapper}>
					<View style={styles.productSummaryContainer}>
						<Image source={{ uri: drawables.noImage }} style={styles.productImg} resizeMode={'cover'} />
						<View style={styles.productInfo}>
							<Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.productName}>
								{strings('market.product')}:
								<Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.productContent}>
									{' '}
									Camera go pro
								</Text>
							</Text>
							<Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.productName}>
								{strings('market.code')}:
								<Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.productContent}>
									{' '}
									rtI1c6WF
								</Text>
							</Text>
							<Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.productName}>
								{strings('market.vendor')}:
								<Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.productContent}>
									{' '}
									0x6006bc519b8b1DeeD74fc43320Bce0c74D32A3AB
								</Text>
							</Text>
						</View>
					</View>
					<View style={styles.ratingWrapper}>
						<Text style={styles.header}>{strings('market.rating_header')}</Text>
						<View style={styles.ratingSection}>
							<Rating
								onFinishRating={this.ratingCompleted}
								style={styles.ratings}
								fractions={1}
								ratingCount={this.maxRatingScore}
								onSwipeRating={this.onRating}
							/>
							<Text style={styles.ratingText}>
								{this.ratingScore}/{this.maxRatingScore}
							</Text>
						</View>
						<Text style={styles.header}>{strings('market.comment_header')}</Text>
						<TextInput
							value={this.title}
							onChangeText={text => (this.title = text)}
							style={styles.input}
							placeholder={strings('market.type_something')}
							textAlignVertical={'top'}
							multiline
						/>
					</View>
					<View style={styles.buttons}>
						<StyledButton type={'confirm'} containerStyle={styles.save} onPress={this.onSave.bind(this)}>
							{strings('market.save')}
						</StyledButton>
						<StyledButton type={'normal'} containerStyle={styles.cancel} onPress={this.onCancel.bind(this)}>
							{strings('market.cancel')}
						</StyledButton>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}
}

export default inject('store')(observer(MarketAddEditReview));
