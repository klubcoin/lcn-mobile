import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react';
import {
	View,
	Text,
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
	TextInput
} from 'react-native';
import { strings } from '../../../../../locales/i18n';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import StyledButton from '../../../UI/StyledButton';
import styles from './styles';
import store from '../store';
import { showError, showSuccess } from '../../../../util/notify';

export class MarketAddEditProduct extends PureComponent {
	static navigationOptions = () => ({ header: null });

	name = '';
	phone = '';
	address = '';
	processing = false;

	constructor(props) {
		super(props);
		makeObservable(this, {
			name: observable,
			phone: observable,
			address: observable,
			processing: observable,
		});

		const { name, phone, address } = store.shippingInfo || {};
		this.name = name || '';
		this.phone = phone || '';
		this.address = address || '';
	}

	resetInputs() {
		this.name = '';
		this.phone = '';
		this.address = '';
	}

	onBack = () => {
		this.resetInputs();
		this.props.navigation.goBack();
	};

	onSave() {
		if (!this.name) {
			return showError(strings('market.missing_name'));
		}
		if (!this.phone) {
			return showError(strings('market.missing_phone'));
		}
		if (!this.address) {
			return showError(strings('market.missing_address'));
		}
		store.setShippingInfo({
			name: this.name,
			phone: this.phone,
			address: this.address,
		})

		const onUpdate = this.props.navigation.getParam('onUpdate');
		onUpdate && onUpdate(data);

		showSuccess(strings('market.saved_successfully'));
		this.onBack();
	}

	onCancel() {
		this.onBack();
	}

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
						<Icon name={'arrow-left'} size={16} style={styles.backIcon} color={colors.white} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.shipping_info')}</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	render() {
		return (
			<KeyboardAvoidingView style={styles.root} behavior={'padding'} enabled={Device.isIos()}>
				{this.renderNavBar()}
				<ScrollView contentContainerStyle={styles.scroll}>
					<Text style={styles.desc}>{strings('market.shipping_info_desc')}</Text>

					<Text style={styles.heading}>{strings('market.name')}</Text>
					<TextInput
						style={styles.input}
						value={this.name}
						onChangeText={text => (this.name = text)}
					/>

					<Text style={styles.heading}>{strings('market.phone')}</Text>
					<TextInput
						value={this.phone}
						onChangeText={text => (this.phone = text)}
						style={styles.input}
						keyboardType={'numeric'}
					/>

					<Text style={styles.heading}>{strings('market.address')}</Text>
					<TextInput
						multiline={true}
						numberOfLines={5}
						value={this.address}
						onChangeText={text => (this.address = text)}
						style={styles.address}
					/>

					<View style={styles.buttons}>
						<StyledButton
							type={'confirm'}
							containerStyle={styles.save}
							onPress={this.onSave.bind(this)}
						>
							{strings('market.save')}
						</StyledButton>

						<StyledButton
							type={'normal'}
							containerStyle={styles.cancel}
							onPress={this.onCancel.bind(this)}
						>
							{strings('market.cancel')}
						</StyledButton>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}
}

export default inject('store')(observer(MarketAddEditProduct));
