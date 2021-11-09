import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react';
import {
	View,
	Text,
	StyleSheet,
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Image,
} from 'react-native';
import { strings } from '../../../../../locales/i18n';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import APIService from '../../../../services/APIService';
import preferences from '../../../../store/preferences';
import NavbarTitle from '../../../UI/NavbarTitle';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import StyledButton from '../../../UI/StyledButton';
import ModalSelector from '../../../UI/AddCustomTokenOrApp/ModalSelector';
import { TextInput } from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import ConfirmModal from '../../../UI/ConfirmModal';
import ImagePicker from 'react-native-image-crop-picker';
import styles from './styles';
import { photos } from '../test';
import drawables from '../../../../common/drawables';

export class MarketAddEditProduct extends PureComponent {
	static navigationOptions = () => ({ header: null });

	categories = [];
	voteTypes = [];
	category = '';
	showCategories = false;
	type = '';
	showTypes = false;
	title = '';
	content = '';
	confirmDeleteVisible = false;
	processing = false;

	constructor(props) {
		super(props);
		makeObservable(this, {
			category: observable,
			categories: observable,
			showCategories: observable,
			type: observable,
			voteTypes: observable,
			showTypes: observable,
			title: observable,
			content: observable,
			confirmDeleteVisible: observable,
			processing: observable,
		});

		this.prefs = props.store;
		this.proposal = props.navigation.getParam('proposal');

		const { uuid, category, title, content, type } = this.proposal || {};
		this.category = category;
		this.title = title;
		this.content = content;
		this.type = type;
		this.uuid = uuid;

		// this.voteTypes = [this.type];
	}

	componentDidMount() {
		this.fetchData();
	}

	async addProposal() {
		const app = await preferences.getCurrentApp();
		const voteInstance = app.instance;

		APIService.createVoteProposal(
			{
				liquivoteInstance: voteInstance.uuid,
				category: this.category,
				title: this.title,
				content: this.content,
				uuid: this.uuid,
			},
			(success, json) => {
				if (success && Array.isArray(json)) {
					this.showNotice(strings('proposal.saved_successfully'), 'success');
					const onUpdate = this.props.navigation.getParam('onUpdate');
					if (onUpdate) {
						onUpdate(json[0]);
					}
					this.onBack();
				} else {
					alert(JSON.stringify(json));
				}
			}
		);
	}

	async fetchData() {
		const app = await preferences.getCurrentApp();
		const voteInstance = app.instance;
		this.categories = [...voteInstance.delegationCategories];
	}

	onBack = () => {
		this.props.navigation.goBack();
	};

	showNotice(message, type) {
		Toast.show({
			type: type || 'error',
			text1: message,
			text2: strings('profile.notice'),
			visibilityTime: 1000
		});
	}

	onSave() {
		if (!this.category) {
			return this.showNotice(strings('proposal.missing_category'));
		}
		if (!this.title) {
			return this.showNotice(strings('proposal.missing_title'));
		}
		if (!this.content) {
			return this.showNotice(strings('proposal.missing_content'));
		}

		this.addProposal();
	}

	onDelete() {
		if (this.processing) {
			return;
		}
		this.processing = true;

		this.confirmDeleteVisible = false;
		APIService.deleteVoteProposal(this.uuid, (success, json) => {
			this.processing = false;
			if (success) {
				const onDelete = this.props.navigation.getParam('onDelete');
				if (onDelete) {
					onDelete();
				}
				this.onBack();
			} else {
				this.showNotice(json.error);
			}
		});
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
			this.images.push(image.path);
		});
	}

	renderCategoryModal = () => {
		const options = this.categories.map(e => ({
			key: e,
			value: e,
		}));

		return (
			<ModalSelector
				visible={!!this.showCategories}
				options={options}
				hideKey={true}
				onSelect={item => {
					this.category = item.value;
					this.showCategories = false;
				}}
				onClose={() => (this.showCategories = false)}
			/>
		);
	};

	renderVoteTypeModal = () => {
		const options = this.voteTypes.map(e => ({
			key: e.shortCode,
			value: e.name,
		}));

		return (
			<ModalSelector
				visible={this.showTypes}
				options={options}
				hideKey={true}
				onSelect={item => {
					this.type = e.value;
					this.showTypes = false;
				}}
				onClose={() => (this.showTypes = false)}
			/>
		);
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
						<Icon name={'arrow-left'} size={16} style={styles.backIcon} />
					</TouchableOpacity>
					<NavbarTitle title={'market.add_product'} disableNetwork />
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	renderSelector({ selected, onTap }) {
		const value = selected;

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
				title={strings('proposal.delete')}
				message={strings('proposal.confirm_delete_message')}
				confirmLabel={strings('proposal.yes')}
				cancelLabel={strings('proposal.no')}
				onConfirm={() => this.onDelete()}
				hideModal={() => (this.confirmDeleteVisible = false)}
			/>
		);
	}

	onAddTag = () => {};

	onAddImage = () => {};

	render() {
		const editing = !!this.uuid;

		return (
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'} enabled={Device.isIos()}>
				{this.renderNavBar()}
				<ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
					<Text style={styles.heading}>{strings('market.product_title')}</Text>
					<TextInput
						value={this.title}
						onChangeText={text => (this.title = text)}
						style={{
							height: 36,
							marginTop: 10,
							paddingHorizontal: 10,
							marginHorizontal: 20,
							borderRadius: 4,
							borderColor: colors.grey400,
							borderWidth: StyleSheet.hairlineWidth,
						}}
					/>

					<Text style={styles.heading}>{strings('market.category')}</Text>
					{this.renderSelector({
						selected: this.category,
						onTap: () => (this.showCategories = true),
					})}

					<Text style={styles.heading}>{strings('market.price')}</Text>
					<TextInput
						value={this.title}
						onChangeText={text => (this.title = text)}
						style={{
							height: 36,
							marginTop: 10,
							paddingHorizontal: 10,
							marginHorizontal: 20,
							borderRadius: 4,
							borderColor: colors.grey400,
							borderWidth: StyleSheet.hairlineWidth,
						}}
					/>

					<Text style={styles.heading}>{strings('market.desc')}</Text>
					<TextInput
						multiline={true}
						numberOfLines={5}
						value={this.content}
						onChangeText={text => (this.content = text)}
						style={{
							height: 100,
							marginTop: 10,
							paddingHorizontal: 10,
							marginHorizontal: 20,
							borderRadius: 4,
							borderColor: colors.grey400,
							borderWidth: StyleSheet.hairlineWidth,
						}}
					/>

					<Text style={styles.heading}>{strings('market.tags')}</Text>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20, marginTop: 10 }}>
						<View style={styles.chip}>
							<Text>tag chip 1</Text>
						</View>
						<View style={styles.chip}>
							<Text>tag chip 2</Text>
						</View>
						<TouchableOpacity onPress={this.onAddTag} style={styles.chip}>
							<Icon style={styles.backIcon} name={'plus'} size={16} />
						</TouchableOpacity>
					</View>

					<Text style={styles.heading}>{strings('market.images')}</Text>
					<View
						style={{
							flexDirection: 'row',
							flexWrap: 'wrap',
							marginHorizontal: 20,
							marginTop: 10,
							backgroundColor: 'blue',
						}}
					>
						<Image style={{ with: 72, height: 72, marginRight: 10 }} source={{ uri: photos[0] }} />
						<Image style={{ with: 72, height: 72, marginRight: 10 }} source={{ uri: photos[1] }} />
						<Image style={{ with: 72, height: 72, marginRight: 10 }} source={{ uri: photos[2] }} />

						<TouchableOpacity onPress={this.onAddImage} style={styles.addImage}>
							<Image style={{ with: 72, height: 72 }} source={{ uri: drawables.image }} />
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
									strings('proposal.delete')
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
				{this.renderConfirmDelete()}
			</KeyboardAvoidingView>
		);
	}
}

export default inject('store')(observer(MarketAddEditProduct));
