import { makeObservable, observable } from 'mobx';
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

export class MarketAddEditProduct extends PureComponent {
	static navigationOptions = () => ({ header: null });

	title = '';
	category = '';
	categories = [];
	showCategories = false;
	price = '';
	quantity = '';
	description = '';
	tags = [];
	showAddTag = false;
	images = [];
	confirmDeleteVisible = false;
	processing = false;
	storeProfile = {};

	constructor(props) {
		super(props);
		makeObservable(this, {
			title: observable,
			category: observable,
			categories: observable,
			showCategories: observable,
			price: observable,
			quantity: observable,
			description: observable,
			tags: observable,
			showAddTag: observable,
			images: observable,
			confirmDeleteVisible: observable,
			processing: observable,
			storeProfile: observable
		});

		this.prefs = props.store;
		this.product = props.navigation.getParam('product');

		const { uuid, title, category, price, quantity, description, tags, images } = this.product || {};
		this.title = title;
		this.category = category;
		this.price = price || '';
		this.quantity = quantity || '';
		this.description = description || '';
		this.tags = tags || [];
		this.images = images || [];
		this.uuid = uuid;
	}

	componentDidMount() {
		this.fetchCategories();
		this.fetchProfile();
	}

	async fetchCategories() {
		const categories = store.marketCategories;
		this.categories = [...categories];

		if (categories && !this.category) {
			this.category = categories[0];
		}

		APIService.getMarketCategories((success, json) => {
			if (success && json) {
				store.saveProductCategories(json);
				this.categories = [...json];

				if (categories && !this.category) {
					this.category = categories[0];
				}
			}
		});
	}

	async fetchProfile() {
		this.storeProfile = store.storeProfile;
	}

	async editProduct() {
		const { selectedAddress } = Engine.state.PreferencesController;
		const { title, category, price, quantity, description, tags, images } = this;
		const data = {
			title,
			category,
			price,
			quantity,
			description,
			tags,
			images,
			currency: this.storeProfile?.defaultCurrency,
			wallet: selectedAddress,
			updatedAt: new Date()
		};
		data.signature = await CryptoSignature.signMessage(selectedAddress, this.uuid + data.title + data.wallet);

		const update = Object.assign({}, this.product, data);
		store.deleteProduct(this.uuid);
		store.addProduct(update);

		const onUpdate = this.props.navigation.getParam('onUpdate');
		onUpdate && onUpdate(update);

		showSuccess(strings('market.saved_successfully'));
		this.onBack();
	}

	async addProduct() {
		const { selectedAddress } = Engine.state.PreferencesController;
		const { title, category, price, quantity, description, tags, images } = this;
		const data = {
			uuid: uuid.v4(),
			title,
			category,
			price,
			quantity,
			description,
			tags,
			images,
			currency: this.storeProfile?.defaultCurrency,
			wallet: selectedAddress,
			createdAt: new Date()
		};
		data.signature = await CryptoSignature.signMessage(selectedAddress, data.uuid + data.title + data.wallet);

		store.addProduct(data);

		const onUpdate = this.props.navigation.getParam('onUpdate');
		onUpdate && onUpdate(data);

		showSuccess(strings('market.saved_successfully'));
		this.onBack();
	}

	resetInputs() {
		this.uuid = null;
		this.product = null;
		this.title = '';
		this.category = this.categories[0];
		this.price = '';
		this.quantity = '';
		this.description = '';
		this.tags = [];
		this.images = [];
		this.processing = false;
	}

	onBack = () => {
		this.resetInputs();
		this.props.navigation.goBack();
	};

	onSave() {
		if (!this.title) {
			return showError(strings('market.missing_title'));
		}
		if (!this.price) {
			return showError(strings('market.missing_price'));
		}
		if (!this.description) {
			return showError(strings('market.missing_description'));
		}
		if (!this.images || this.images.length == 0) {
			return showError(strings('market.missing_photo'));
		}

		if (this.uuid && this.product) {
			this.editProduct();
		} else {
			this.addProduct();
		}
	}

	async onDelete() {
		await store.deleteProduct(this.uuid);
		const onDelete = this.props.navigation.getParam('onDelete');
		if (onDelete) onDelete();
		this.onBack();
	}

	onCancel() {
		this.onBack();
	}

	onPickImage() {
		ImagePicker.openPicker({
			width: 300,
			height: 300,
			cropping: true
		}).then(image => {
			console.log('this images', this.images);
			this.images.push(image.path);
		});
	}

	renderCategoryModal = () => {
		const options = this.categories.map(e => ({
			key: e.uuid,
			value: e.name
		}));

		return (
			<ModalSelector
				visible={!!this.showCategories}
				options={options}
				hideKey={true}
				onSelect={item => {
					this.category = this.categories.find(e => e.uuid == item.key);
					this.showCategories = false;
				}}
				onClose={() => (this.showCategories = false)}
			/>
		);
	};

	renderNavBar() {
		const isEditing = this.props.navigation.getParam('isEditing');

		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
						<Icon name={'arrow-left'} size={16} style={styles.backIcon} />
					</TouchableOpacity>
					<NavbarTitle title={!isEditing ? 'market.add_product' : 'market.edit_product'} disableNetwork />
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	renderSelector({ selected, onTap }) {
		const category = selected ?? this.categories[0];
		const value = category?.name || '';

		return (
			<TouchableOpacity style={styles.selectOption} activeOpacity={0.8} onPress={() => onTap && onTap()}>
				<Text style={[fontStyles.normal, styles.option]}>{value}</Text>
				<FontAwesome name={'caret-down'} size={20} style={styles.dropdownIcon} />
			</TouchableOpacity>
		);
	}

	renderConfirmDelete() {
		return (
			<ConfirmModal
				visible={this.confirmDeleteVisible}
				title={strings('market.delete')}
				message={strings('market.confirm_delete_message')}
				confirmLabel={strings('market.yes')}
				cancelLabel={strings('market.no')}
				onConfirm={() => this.onDelete()}
				hideModal={() => (this.confirmDeleteVisible = false)}
			/>
		);
	}

	renderAddTagModal() {
		return (
			<ConfirmInputModal
				visible={this.showAddTag}
				title={strings('market.add_tag')}
				value={this.tag}
				confirmLabel={strings('market.save')}
				cancelLabel={strings('market.cancel')}
				onConfirm={text => this.tags.push(text)}
				hideModal={() => (this.showAddTag = false)}
			/>
		);
	}

	onAddTag = () => {
		this.showAddTag = true;
	};

	deleteImage = (image) => {
		this.images.splice(this.images.indexOf(image));
	}

	render() {
		const editing = !!this.uuid && this.product;
		const { defaultCurrency } = this.storeProfile;

		return (
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'} enabled={Device.isIos()}>
				{this.renderNavBar()}
				<ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
					<Text style={styles.heading}>{strings('market.product_title')}</Text>
					<TextInput value={this.title} onChangeText={text => (this.title = text)} style={styles.input} />

					<Text style={styles.heading}>{strings('market.category')}</Text>
					{this.renderSelector({
						selected: this.category,
						onTap: () => (this.showCategories = true)
					})}

					<Text style={styles.heading}>{strings('market.price')}</Text>
					<View style={[styles.input, styles.containerPrice]}>
						<TextInput
							value={this.price}
							onChangeText={text => (this.price = text)}
							style={styles.price}
							keyboardType={'numeric'}
						/>
						<View style={styles.stickerContainer}>
							{defaultCurrency?.name === routes.mainNetWork.name ? (
								<NetworkMainAssetLogo style={styles.tokenLogo} />
							) : (
								<AssetIcon logo={defaultCurrency?.logo} customStyle={styles.tokenLogo} />
							)}
							<Text style={styles.tokenName}>{defaultCurrency?.symbol}</Text>
						</View>
					</View>

					<Text style={styles.heading}>{strings('market.quantity')}</Text>
					<TextInput
						value={this.quantity}
						onChangeText={text => (this.quantity = text)}
						style={styles.input}
						keyboardType={'numeric'}
					/>

					<Text style={styles.heading}>{strings('market.desc')}</Text>
					<TextInput
						multiline={true}
						numberOfLines={5}
						value={this.description}
						onChangeText={text => (this.description = text)}
						style={styles.desc}
					/>

					<Text style={styles.heading}>{strings('market.tags')}</Text>
					<View style={styles.tags}>
						{this.tags.map(e => (
							<View style={styles.chip}>
								<Text>{e}</Text>
							</View>
						))}
						<TouchableOpacity onPress={this.onAddTag} style={styles.addChip}>
							<Icon style={styles.addIcon} name={'plus'} size={16} />
						</TouchableOpacity>
					</View>

					<Text style={styles.heading}>{strings('market.images')}</Text>
					<View style={styles.photos}>
						{this.images.map(e => (
							<View style={styles.photo}>
								<Image style={styles.image} source={{ uri: e }} />
								<TouchableOpacity style={styles.deleteImage} onPress={() => this.deleteImage(e)}>
									<Icon name={'close'} color={colors.red} size={20} />
								</TouchableOpacity>
							</View>
						))}
						<TouchableOpacity onPress={() => this.onPickImage()} style={styles.photo}>
							<Image style={styles.image} source={{ uri: drawables.noImage }} />
							<Icon style={styles.addImageIcon} name={'plus'} size={16} />
						</TouchableOpacity>
					</View>

					<View style={styles.buttons}>
						<StyledButton type={'confirm'} containerStyle={styles.save} onPress={this.onSave.bind(this)}>
							{strings('market.save')}
						</StyledButton>
						{editing ? (
							<StyledButton
								type={'danger'}
								containerStyle={styles.cancel}
								onPress={() => (this.confirmDeleteVisible = true)}
							>
								{this.processing ? (
									<ActivityIndicator color={colors.white} size={18} />
								) : (
									strings('market.delete')
								)}
							</StyledButton>
						) : (
							<StyledButton
								type={'normal'}
								containerStyle={styles.cancel}
								onPress={this.onCancel.bind(this)}
							>
								{strings('market.cancel')}
							</StyledButton>
						)}
					</View>
				</ScrollView>

				{this.renderCategoryModal()}
				{this.renderAddTagModal()}
				{this.renderConfirmDelete()}
			</KeyboardAvoidingView>
		);
	}
}

export default inject('store')(observer(MarketAddEditProduct));
