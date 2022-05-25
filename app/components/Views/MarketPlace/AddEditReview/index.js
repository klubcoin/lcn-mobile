import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react';
import { View, Text, KeyboardAvoidingView, TouchableOpacity, Image } from 'react-native';
import { strings } from '../../../../../locales/i18n';
import Device from '../../../../util/Device';
import APIService from '../../../../services/APIService';
import NavbarTitle from '../../../UI/NavbarTitle';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import StyledButton from '../../../UI/StyledButton';
import styles from './styles';
import Engine from '../../../../core/Engine';
import { showError, showSuccess } from '../../../../util/notify';
import { Rating } from 'react-native-ratings';
import moment from 'moment';
import TrackingTextInput from '../../../UI/TrackingTextInput';
import TrackingScrollView from '../../../UI/TrackingScrollView';

export class MarketAddEditReview extends PureComponent {
	static navigationOptions = () => ({ header: null });

	product = {};
	maxRatingScore = 5;
	ratingScore = 2.5;
	comment = '';

	constructor(props) {
		super(props);
		makeObservable(this, {
			ratingScore: observable,
			product: observable,
			comment: observable
		});
	}

	componentDidMount() {
		this.product = this.props.navigation.getParam('product');
	}

	onBack = () => {
		this.props.navigation.goBack();
	};

	onAddReview = () => {
		const comments = this.comment.trim();
		const rating = this.ratingScore;
		const purchaseDate = moment(); //TODO: update purchased date
		const { images, title, uuid, vendor } = this.product;
		const { selectedAddress } = Engine.state.PreferencesController;

		APIService.createReview(
			{
				purchaseDate, //TODO: update purchased date
				sellerWalletAddress: vendor.address,
				buyerWalletAddress: selectedAddress,
				productCode: uuid,
				rating,
				comments
			},
			(success, json) => {
				if (success) showSuccess(strings('market.add_review_success'));
				else showError(strings('market.add_review_failed'));
			}
		);
		this.onBack();
	};

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
		const { images, title, uuid, vendor } = this.product;

		return (
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'} enabled={Device.isIos()}>
				{this.renderNavBar()}
				<TrackingScrollView contentContainerStyle={styles.wrapper}>
					<View style={styles.productSummaryContainer}>
						<Image
							source={{ uri: images ? images[0] : null }}
							style={styles.productImg}
							resizeMode={'cover'}
						/>
						<View style={styles.productInfo}>
							<Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.productName}>
								{`${strings('market.product')}: `}
								<Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.productContent}>
									{title}
								</Text>
							</Text>
							<Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.productName}>
								{`${strings('market.code')}: `}
								<Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.productContent}>
									{uuid}
								</Text>
							</Text>
							<Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.productName}>
								{`${strings('market.vendor')}: `}
								<Text numberOfLines={1} ellipsizeMode={'middle'} style={styles.productContent}>
									{vendor?.address}
								</Text>
							</Text>
						</View>
					</View>
					<View style={styles.ratingWrapper}>
						<Text style={styles.header}>{strings('market.rating_header')}</Text>
						<View style={styles.ratingSection}>
							<Rating
								style={styles.ratings}
								fractions={1}
								ratingCount={this.maxRatingScore}
								onSwipeRating={this.onRating}
								onFinishRating={this.onRating}
							/>
							<Text style={styles.ratingText}>
								{this.ratingScore}/{this.maxRatingScore}
							</Text>
						</View>
						<Text style={styles.header}>{strings('market.comment_header')}</Text>
						<TrackingTextInput
							value={this.comment}
							onChangeText={text => (this.comment = text)}
							style={styles.input}
							placeholder={strings('market.type_something')}
							textAlignVertical={'top'}
							multiline
						/>
					</View>
					<View style={styles.buttons}>
						<StyledButton type={'confirm'} containerStyle={styles.save} onPress={this.onAddReview}>
							{strings('market.add_review')}
						</StyledButton>
						<StyledButton type={'normal'} containerStyle={styles.cancel} onPress={this.onCancel.bind(this)}>
							{strings('market.cancel')}
						</StyledButton>
					</View>
				</TrackingScrollView>
			</KeyboardAvoidingView>
		);
	}
}

export default inject('store')(observer(MarketAddEditReview));
