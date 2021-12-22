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
import CryptoSignature, { sha256 } from '../../../../core/CryptoSignature';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import store from '../store';
import Cart from '../components/Cart';
import { showError } from '../../../../util/notify';
import { StoreQuery } from '../store/StoreMessages';
import { refStoreService } from '../store/StoreService';
import StoreImage from '../components/StoreImage';
import Api from '../../../../services/api';

const window = Dimensions.get('window');
const screenWidth = window.width;
const rowSize = isTablet() ? 4 : 3;

class MarketProduct extends PureComponent {
	static navigationOptions = () => ({ header: null });

	product = {};
	favorite = false;
	readMore = false;
	quantity = 1;
	cartBadge = 0;
	otherProducts = [];
	vendorProfile = {};

	constructor(props) {
		super(props);
		makeObservable(this, {
			product: observable,
			favorite: observable,
			readMore: observable,
			quantity: observable,
			cartBadge: observable,
			otherProducts: observable,
			vendorProfile: observable,
		});

		this.product = props.navigation.getParam('product');

		const { selectedAddress } = Engine.state.PreferencesController;
		this.isOwner = selectedAddress == this.product.wallet;
		store.addRecentlyViewedProduct(this.product);
	}

	componentDidMount() {
		this.fetchData();
		this.fetchOtherProducts();
	}

	componentDidUpdate(prevProps) {
		if (this.props != prevProps) {
			this.product = this.props.navigation.getParam('product');
			this.fetchData();
		}
	}

	async fetchData() {
		const vendor = this.props.navigation.getParam('vendor');
		if (!vendor) {
			const response = await this.getWalletInfo(this.product.wallet);
			if (response && response.address) {
				this.vendorProfile = response;
			}
		}
		this.favorite = store.marketFavoriteProducts.find(e => e.uuid == this.product.uuid);
	}

	getWalletInfo = async (address) => {
		return new Promise((resolve, reject) =>
			Api.postRequest(
				routes.walletInfo,
				[address],
				response => {
					if (response.result) {
						resolve({ address, ...response.result });
					} else {
						reject(response);
					}
				},
				error => reject(error)
			));
	};

	fetchOtherProducts = () => {
		const { category, wallet } = this.product;
		const hash = category?.hash;

		const storeService = refStoreService();
		storeService.queryProductOnVendorStore(wallet, { query: '' }, hash);

		storeService.addListener(data => {
			if (data.action == StoreQuery().action && data.hash == hash) {
				this.otherProducts = [...data.data.result];
			}
		});
	};

	onBack = () => {
		this.props.navigation.goBack();
	};

	openCart = () => {
		this.props.navigation.navigate('ShoppingCart');
	};

	renderNavBar() {
		return (
			<SafeAreaView style={{ zIndex: 100 }}>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'arrow-left'} size={RFValue(12)} />
					</TouchableOpacity>
					<NavbarTitle title={this.product?.title} disableNetwork translate={false} />
					<Cart onPress={this.openCart} />
				</View>
			</SafeAreaView>
		);
	}

	renderImage = ({ item }) => {
		return <StoreImage style={styles.image} address={this.product.wallet} path={item} local={this.isOwner} />
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
					onChangeText={text => {
						const cleanNumber = text?.replace(/[^0-9]/g, "") || 0;
						this.quantity = parseInt(cleanNumber)
					}

					}
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
		store.setCartBadge(store.cartBadge + this.quantity);
		store.addToCart({
			uuid: this.product.uuid,
			product: this.product,
			quantity: this.quantity
		});
	};

	//TODO: remove addReview function (because it's just for testing)
	addReview = () => {
		this.props.navigation.navigate('MarketAddEditReview', { product: this.product });
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
				{/*TODO: please remove review button, because it just for testing*/}
				<TouchableOpacity style={styles.purchase} activeOpacity={0.6} onPress={this.addReview}>
					<Text style={styles.addToCart}>{strings('market.add_review')}</Text>
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
		const vendor = this.props.navigation.getParam('vendor');
		const { profile } = vendor || {
			profile: {
				storeName: this.vendorProfile?.name,
				phone: this.vendorProfile?.publicInfo?.shippingAddress?.phone,
			}
		};

		return (
			<View>
				<Text style={styles.heading}>{strings('market.contact_info')}</Text>
				<View style={styles.info}>
					<View style={styles.infoColumn}>
						<Text style={styles.infoTitle}>{strings('market.provided_by')}</Text>
						<Text style={styles.infoDesc}>{profile?.storeName || '_'}</Text>
					</View>
					<View style={styles.infoColumn}>
						<Text style={styles.infoTitle}>{strings('market.contact_phone')}</Text>
						<Text style={styles.infoDesc}>{profile?.phone || '_'}</Text>
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
		const slideCount = Math.ceil(store.marketRecentProducts.length / rowSize);
		const data = Array(slideCount)
			.fill(0)
			.map((e, index) => ({ index }));

		console.log('data123', data);

		return (
			<View>
				<Text style={styles.heading}>{strings('market.recently_viewed')}</Text>
				<View style={styles.section}>
					<Carousel
						ref={e => (this.viewedProductSlider = e)}
						data={data}
						renderItem={this.renderRecentProductSlide}
						autoplay={true}
						loop={true}
						autoplayInterval={3000}
						sliderWidth={screenWidth - 20}
						itemWidth={screenWidth - 20}
					/>
				</View>
			</View>
		);
	};

	renderRecentProductSlide = ({ item }) => {
		const { index } = item;
		const start = index * rowSize;
		const items = store.marketRecentProducts.slice(start, start + rowSize);
		if (items.length != rowSize) {
			Array(rowSize - items.length)
				.fill(false)
				.map(() => items.push(false));
		}
		const width = (screenWidth - 40) / rowSize - 20;

		return (
			<View style={styles.slide}>
				{items.map((e, i) => {
					if (!e) return <View style={{ width }} />;

					const { price, discountPrice, title, images, currency } = e;

					return (
						<TouchableOpacity
							activeOpacity={0.6}
							style={{ width, alignItems: 'center' }}
							onPress={() => (this.product = e)}
						>
							<StoreImage style={{ width, height: width }} address={this.product?.wallet} path={images[0]} local={this.isOwner} />
							<Text numberOfLines={2} style={styles.rpTitle}>
								{title}
							</Text>
							<Text numberOfLines={1} style={styles.rpFinalPrice}>
								{discountPrice ?? price} {currency?.symbol || routes.mainNetWork.ticker}
							</Text>
							<Text numberOfLines={1} style={styles.rpPrice}>
								{price} {currency?.symbol || routes.mainNetWork.ticker}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		);
	};

	renderOtherProductSlide = ({ item }) => {
		const { index } = item;
		const start = index * rowSize;
		const items = this.otherProducts.slice(start, start + rowSize);
		if (items.length != rowSize) {
			Array(rowSize - items.length)
				.fill(false)
				.map(() => items.push(false));
		}
		const width = (screenWidth - 40) / rowSize - 20;

		return (
			<View style={styles.slide}>
				{items.map((e, i) => {
					if (!e) return <View style={{ width }} />;

					const { price, discountPrice, title, images, currency } = e;

					return (
						<TouchableOpacity
							activeOpacity={0.6}
							style={{ width, alignItems: 'center' }}
							onPress={() => (this.product = e)}
						>
							<StoreImage style={{ width, height: width }} address={this.product?.wallet} path={images[0]} local={this.isOwner} />
							<Text numberOfLines={2} style={styles.rpTitle}>
								{title}
							</Text>
							<Text numberOfLines={1} style={styles.rpFinalPrice}>
								{discountPrice ?? price} {currency?.symbol || routes.mainNetWork.ticker}
							</Text>
							<Text numberOfLines={1} style={styles.rpPrice}>
								{price} {currency?.symbol || routes.mainNetWork.ticker}
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		);
	};

	renderOtherProducts = () => {
		const slideCount = Math.ceil(this.otherProducts.length / rowSize);
		const data = Array(slideCount)
			.fill(0)
			.map((e, index) => ({ index }));

		return (
			<View>
				<Text style={styles.heading}>{strings('market.products_same_vendor')}</Text>
				<View style={styles.section}>
					<Carousel
						ref={e => (this.otherProductSlider = e)}
						data={data}
						renderItem={this.renderOtherProductSlide}
						autoplay={true}
						loop={true}
						autoplayInterval={3000}
						sliderWidth={screenWidth - 20}
						itemWidth={screenWidth - 20}
					/>
				</View>
			</View>
		);
	};

	editProduct = () => {
		this.props.navigation.navigate('MarketAddEditProduct', {
			product: this.product,
			onUpdate: data => {
				Object.assign(this.product, data);

				const onUpdate = this.props.navigation.getParam('onUpdate');
				onUpdate && onUpdate(this.product);
			},
			onDelete: () => {
				const onUpdate = this.props.navigation.getParam('onUpdate');
				onUpdate && onUpdate(this.product);

				this.onBack();
			},
			isEditing: true
		});
	};

	renderEditButton = () => {
		if (!this.isOwner) return;

		return (
			<TouchableOpacity style={styles.edit} activeOpacity={0.6} onPress={this.editProduct}>
				<Icon style={styles.editIcon} name={'pencil'} size={20} />
			</TouchableOpacity>
		);
	};

	openChat = async () => {
		const { uuid, title, wallet, signature } = this.product || {};
		const address = await CryptoSignature.recoverMessageSignature(uuid + title + wallet, signature);
		if (address.toLocaleLowerCase() != wallet.toLocaleLowerCase()) {
			showError(strings('market.insecure_vendor'));
		}
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
								<Text style={styles.price}>{`${product.price} ${product.currency?.symbol ||
									routes.mainNetWork.ticker}`}</Text>
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
				{this.renderEditButton()}
				{this.renderChatButton()}
			</View>
		);
	}
}

export default inject('store')(observer(MarketProduct));
