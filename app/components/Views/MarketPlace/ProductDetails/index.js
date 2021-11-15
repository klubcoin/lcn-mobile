import React, { PureComponent } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import styles from './styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import IonIcon from 'react-native-vector-icons/Ionicons';
import NavbarTitle from '../../../UI/NavbarTitle';
import routes from '../../../../common/routes';
import { strings } from '../../../../../locales/i18n';
import Carousel from 'react-native-snap-carousel';
import { isTablet } from 'react-native-device-info';
import Engine from '../../../../core/Engine';
import CryptoSignature from '../../../../core/CryptoSignature';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import store from '../store';

const window = Dimensions.get('window');
const screenWidth = window.width;

class MarketProduct extends PureComponent {
	static navigationOptions = () => ({ header: null });

	product = {};
	favorite = false;
	readMore = false;
	quantity = 1;
	cartBadge = 0;

	constructor(props) {
		super(props);
		makeObservable(this, {
			product: observable,
			favorite: observable,
			readMore: observable,
			quantity: observable,
			cartBadge: observable
		});

		this.product = props.navigation.getParam('product');
		this.favorite = true; //TODO: check if product was added to favorite list
		this.cartBadge = 0; //TODO: get product count from cart

		store.addRecentlyViewedProduct(this.product);
	}

	componentDidMount() {
		this.fetchData();
	}

	componentDidUpdate(prevProps) {
		if (this.props != prevProps) {
			this.product = this.props.navigation.getParam('product');
			this.fetchData();
		}
	}

	async fetchData() {
		this.favorite = store.marketFavoriteProducts.find(e => e.uuid == this.product.uuid);
	}

	onBack = () => {
		this.props.navigation.goBack();
	};

	openCart = () => {
		this.props.navigation.navigate('MarketCart');
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'arrow-left'} size={RFValue(12)} />
					</TouchableOpacity>
					<NavbarTitle title={this.product?.title} disableNetwork translate={false} />
					<View style={styles.cart}>
						<TouchableOpacity onPress={this.openCart} style={styles.navButton}>
							<IonIcon style={styles.cartIcon} name={'cart-outline'} size={RFValue(18)} />
							{this.cartBadge > 0 && (
								<View style={styles.badge}>
									<Text style={styles.counter}>{this.cartBadge}</Text>
								</View>
							)}
						</TouchableOpacity>
					</View>
				</View>
			</SafeAreaView>
		);
	}

	renderImage = ({ item }) => {
		return <Image style={styles.image} source={{ uri: item }} />;
	};

	decreaseQuantity = () => {
		const quantity = +this.quantity - 1;
		this.quantity = quantity < 1 ? 1 : quantity;
	};

	increaseQuantity = () => {
		this.quantity = +this.quantity + 1;
	};

	addFavorite = () => {
		this.favorite = !this.favorite;
		if (this.favorite) {
			store.addFavoriteProduct(this.product);
		} else {
			store.removeFavoriteProduct(this.product.uuid);
		}
	};

	renderQuantity = () => {
		return (
			<View style={styles.quantityView}>
				<TouchableOpacity style={styles.adjustQuantity} activeOpacity={0.6} onPress={this.decreaseQuantity}>
					<Icon style={styles.quantityIcon} name={'minus'} size={RFPercentage(2)} />
				</TouchableOpacity>
				<TextInput
					value={`${this.quantity}`}
					onChangeText={text => (this.quantity = text)}
					style={styles.quantity}
					keyboardType={'numeric'}
				/>
				<TouchableOpacity style={styles.adjustQuantity} activeOpacity={0.6} onPress={this.increaseQuantity}>
					<Icon style={styles.quantityIcon} name={'plus'} size={RFPercentage(2)} />
				</TouchableOpacity>
			</View>
		);
	};

	onPurchase = () => {
		this.cartBadge += this.quantity;
	};

	renderAddToCart = () => {
		return (
			<View style={{ flexDirection: 'row' }}>
				<TouchableOpacity style={styles.purchase} activeOpacity={0.6} onPress={this.onPurchase}>
					<Text style={styles.addToCart}>{strings('market.add_to_cart')}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.addFavorite} activeOpacity={0.6} onPress={this.addFavorite}>
					<Icon style={styles.favorite} name={this.favorite ? 'heart' : 'heart-o'} size={RFPercentage(2)} />
				</TouchableOpacity>
			</View>
		);
	};

	renderTags = () => {
		const { tags } = this.product || {};

		return (
			<View style={styles.tags}>
				<Text style={styles.tagLabel}>{strings('market.tags')}: </Text>
				<Text style={styles.tag}>{tags.join('; ')}</Text>
			</View>
		);
	};

	renderRating = () => {
		return (
			<View style={styles.columns}>
				<View>
					<Text style={styles.infoTitle}>{strings('market.review')}</Text>
					<Text style={styles.infoDesc}>{'4.2'}</Text>
				</View>
				<View style={styles.spacing}>
					<Text style={styles.infoTitle}>{strings('market.purchased')}</Text>
					<Text style={styles.infoDesc}>{'500+'}</Text>
				</View>
			</View>
		);
	};

	toggleReadMore = () => {
		this.readMore = !this.readMore;
	};

	renderProductInfo = () => {
		const { product } = this;
		const hasMore = product.description.length > 200;
		const desc = this.readMore ? product.description : product.description.substr(0, 200);

		return (
			<View>
				<Text style={styles.heading}>Description</Text>
				<Text style={styles.desc}>{desc}</Text>
				{hasMore && !this.readMore && (
					<TouchableOpacity style={styles.readMore} activeOpacity={0.6} onPress={this.toggleReadMore}>
						<Text style={styles.more}>{strings('market.read_more')}</Text>
					</TouchableOpacity>
				)}
			</View>
		);
	};

	renderAdditionalInfo = () => {
		const { provider } = this.product || {};

		return (
			<View>
				<Text style={styles.heading}>{strings('market.contact_info')}</Text>
				<View style={styles.info}>
					<View style={styles.infoColumn}>
						<Text style={styles.infoTitle}>{strings('market.provided_by')}</Text>
						<Text style={styles.infoDesc}>{provider?.name || '_'}</Text>
					</View>
					<View style={styles.infoColumn}>
						<Text style={styles.infoTitle}>{strings('market.contact_phone')}</Text>
						<Text style={styles.infoDesc}>{provider?.phone || '_'}</Text>
					</View>
				</View>
			</View>
		);
	};

	renderReviews = () => {
		const { product } = this;

		return (
			<View>
				<Text style={styles.heading}>{strings('market.reviews')}</Text>
				{!product.reviews || product.reviews.length == 0 ? (
					<Text style={styles.desc}>{strings('market.no_review_yet')}</Text>
				) : (
					product.reviews?.map(e => (
						<View>
							<Text style={styles.user}>
								{e.name}
								<Text style={styles.rating}> ({e.rating})</Text>
							</Text>
							<Text style={styles.comment}>{e.comment}</Text>
						</View>
					))
				)}
			</View>
		);
	};

	renderRecentlyViewedProducts = () => {
		return (
			<View>
				<Text style={styles.heading}>{strings('market.recently_viewed')}</Text>
				<Text>....</Text>
			</View>
		);
	};

	renderOtherProducts = () => {
		return (
			<View>
				<Text style={styles.heading}>{strings('market.products_same_provider')}</Text>
				<Text>....</Text>
			</View>
		);
	};

	openChat = async () => {
		const { uuid, title, wallet, signature } = this.product || {};
		const address = await CryptoSignature.recoverMessageSignature(uuid + title + wallet, signature);
		this.props.navigation.navigate('Chat', { selectedContact: { address } });
	};

	renderChatButton = () => {
		return (
			<TouchableOpacity style={styles.chat} activeOpacity={0.6} onPress={this.openChat}>
				<IonIcon style={styles.chatBubble} name={'chatbubble-ellipses-outline'} size={28} />
			</TouchableOpacity>
		);
	};

	render() {
		const { product } = this;

		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				<ScrollView nestedScrollEnabled>
					<View style={[styles.header, isTablet() && { flexDirection: 'row' }]}>
						<View style={styles.carousel}>
							<Carousel
								ref={e => (this._carousel = e)}
								data={product.images}
								renderItem={this.renderImage}
								autoplay={true}
								loop={true}
								autoplayInterval={3000}
								sliderWidth={isTablet() ? screenWidth / 2 : screenWidth - 20}
								itemWidth={isTablet() ? screenWidth / 2 : screenWidth - 20}
							/>
						</View>
						<View style={styles.about}>
							<Text style={styles.title}>{product.title}</Text>
							<Text style={styles.category}>{product.category?.name}</Text>
							<View style={styles.pricing}>
								<Text style={styles.price}>{`${product.price} ${routes.mainNetWork.ticker}`}</Text>
							</View>
							<View style={styles.actions}>
								{this.renderQuantity()}
								{this.renderAddToCart()}
							</View>
							{this.renderTags()}
							{this.renderRating()}
						</View>
					</View>

					<View style={styles.body}>
						{this.renderProductInfo()}
						{this.renderAdditionalInfo()}
						{this.renderReviews()}
						{this.renderRecentlyViewedProducts()}
						{this.renderOtherProducts()}
					</View>
				</ScrollView>
				{this.renderChatButton()}
			</View>
		);
	}
}

export default inject('store')(observer(MarketProduct));
