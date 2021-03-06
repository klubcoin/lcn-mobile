import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react';
import {
	View,
	Text,
	KeyboardAvoidingView,
	TouchableOpacity,
} from 'react-native';
import { strings } from '../../../../../locales/i18n';
import Device from '../../../../util/Device';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from './styles';
import routes from '../../../../common/routes';
import { Rating } from 'react-native-ratings';
import { RFValue } from 'react-native-responsive-fontsize';
import API from '../../../../services/api';
import ScrollViewMore from '../../../UI/ScrollMore/ScrollViewMore';

export class MarketProductReview extends PureComponent {
	static navigationOptions = () => ({ header: null });

	reviews = [];
	addressDic = {};
	averageRating = 0;
	maxIndex = 10;
	pageSize = 0;

	constructor(props) {
		super(props);
		makeObservable(this, {
			reviews: observable,
			averageRating: observable
		});
	}

	componentDidMount() {
		this.fetchReviews();
	}

	onBack = () => {
		this.props.navigation.goBack();
	};

	fetchReviews = async () => {
		this.reviews = this.props.navigation.getParam('reviews');
		this.reviews.sort((a, b) => b.reviewDate - a.reviewDate);
		this.averageRating =
			this.reviews.reduce((sum, current) => sum + (current.rating ?? 0), 0) / this.reviews.length;
		this.averageRating = this.averageRating.toFixed(1);
		this.fetchWalletInfos();
	};

	fetchWalletInfos = async () => {
		if (this.pageSize >= this.reviews.length) return;

		const maxItem =
			this.maxIndex > this.reviews.length ? this.reviews.length - this.pageSize : this.maxIndex - this.pageSize;
		for (var i = 0; i < maxItem; i++) {
			this.getWalletInfo(this.reviews[i]?.buyerWalletAddress, i);
		}
		this.maxIndex += 10;
		this.pageSize += maxItem;
	};

	getWalletInfo = async (address, index) => {
		if (address in this.addressDic) {
			this.reviews[index].info = this.addressDic[address];
			return;
		}

		API.postRequest(
			routes.walletInfo,
			[address],
			response => {
				if (response.result) {
					this.addressDic[address] = response.result;
					this.reviews[index].info = response.result;
				}
			},
			error => {
				console.log('error', error);
			}
		);
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'arrow-left'} size={RFValue(15)} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.review')}</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	renderOverview() {
		return (
			<View style={styles.overviewContainer}>
				<Text style={styles.ratingScore}>{this.averageRating}</Text>
				<View style={styles.ratingContainer}>
					<Rating
						readonly
						style={styles.ratings}
						fractions={1}
						imageSize={25}
						startingValue={this.averageRating}
					/>
					<Text style={styles.totalReview}>
						Total {this.reviews.length + ' ' + strings('market.reviews').toLowerCase()}
					</Text>
				</View>
			</View>
		);
	}

	renderReviews() {
		return (
			<SafeAreaView style={{ flex: 1 }}>
				<ScrollViewMore customStyle={styles.reviewsBody} onScroll={this.fetchWalletInfos}>
					{this.reviews.slice(0, this.pageSize).map(e => (
						<View style={styles.reviewItem}>
							<View style={styles.reviewHeader}>
								<Text style={styles.userName} numberOfLines={1} ellipsizeMode={'middle'}>
									{/* {'0x' + e.buyerWalletAddress} */}
									{e?.info?.name || strings('market.anonymous')}
								</Text>
								<Text style={styles.scoreReviewItem}> ({e.rating?.toFixed(1) ?? 0}) </Text>
							</View>

							<Rating
								readonly
								style={styles.ratingReviewItem}
								fractions={1}
								imageSize={16}
								startingValue={e.rating ?? 0}
							/>
							<Text style={styles.productName} numberOfLines={1} ellipsizeMode={'middle'}>
								{strings('market.purchased')}: {e.productCode}
							</Text>
							<Text style={styles.reviewText}>{e.comments}</Text>
						</View>
					))}
				</ScrollViewMore>
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

export default inject('store')(observer(MarketProductReview));
