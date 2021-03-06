import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import { strings } from '../../../../../locales/i18n';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import NavbarTitle from '../../../UI/NavbarTitle';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import StyledButton from '../../../UI/StyledButton';
import ModalSelector from '../../../UI/AddCustomTokenOrApp/ModalSelector';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import APIService from '../../../../services/APIService';
import preferences from '../../../../store/preferences';
import Toast from 'react-native-toast-message';
import TrackingScrollView from '../../../UI/TrackingScrollView';

const styles = StyleSheet.create({
	navBar: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	navButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center'
	},
	backIcon: {
		color: colors.blue
	},
	selectOption: {
		flexDirection: 'row',
		marginHorizontal: 20,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 4,
		borderColor: colors.grey300,
		alignItems: 'center',
		marginTop: 8
	},
	option: {
		flex: 1,
		padding: 10
	},
	dropdownIcon: {
		marginHorizontal: 10,
		alignSelf: 'center'
	},
	headingTitle: {
		fontSize: 24,
		fontWeight: '600',
		color: colors.grey,
		marginTop: 20,
		paddingHorizontal: 10
	},
	line: {
		height: 1,
		backgroundColor: colors.grey100,
		marginHorizontal: 40,
		marginVertical: 20
	},
	heading: {
		paddingHorizontal: 20,
		marginTop: 15,
		fontSize: 16
	},
	date: {
		marginTop: 5,
		paddingHorizontal: 5,
		paddingVertical: 5,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey300,
		marginHorizontal: 20,
		borderRadius: 4
	},
	buttons: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 30
	},
	save: {
		width: 140
	},
	cancel: {
		width: 140,
		marginLeft: 20
	}
});

const dateFormat = 'YYYY-MM-DD';

export class DelegationAddEdit extends PureComponent {
	static navigationOptions = () => ({ header: null });

	delegees = [];
	categories = [];

	delegee = '';
	showDelegees = false;
	category = '';
	showCategories = false;

	fromDate = '';
	toDate = '';
	showFromDate = false;
	showToDate = false;

	constructor(props) {
		super(props);
		makeObservable(this, {
			delegees: observable,
			categories: observable,

			delegee: observable,
			showDelegees: observable,
			category: observable,
			showCategories: observable,

			fromDate: observable,
			toDate: observable,
			showFromDate: observable,
			showToDate: observable
		});

		this.prefs = props.store;
		this.delegation = props.navigation.getParam('delegation');

		const { uuid, category, delegatedTo, fromDate, toDate } = this.delegation || {};
		this.uuid = uuid;
		this.category = category;
		this.delegee = delegatedTo;
		this.fromDate = moment(fromDate).format(dateFormat);
		this.toDate = moment(toDate).format(dateFormat);
	}

	componentDidMount() {
		this.fetchData();
	}

	showNotice(message, type) {
		Toast.show({
			type: type || 'error',
			text1: message,
			text2: strings('profile.notice'),
			visibilityTime: 1000
		});
	}

	async addDelegation() {
		const app = await preferences.getCurrentApp();
		const wallet = app.uuid;

		APIService.createVoteDelegation(
			{
				uuid: this.uuid,
				voterId: wallet,
				category: this.category,
				delegatedTo: wallet,
				fromDate: this.fromDate,
				toDate: this.toDate
			},
			(success, json) => {
				if (success && Array.isArray(json)) {
					this.showNotice(strings('proposal.saved_successfully'), 'success');
					const onUpdate = this.props.navigation.getParam('onUpdate');
					if (onUpdate) onUpdate(json[0]);
					this.onBack();
				} else {
					this.showNotice(json.error);
				}
			}
		);
	}

	async fetchData() {
		this.delegees = [this.delegee];
		this.categories = [this.category];
	}

	onBack = () => {
		this.props.navigation.goBack();
	};

	onSave() {
		if (!this.delegee) {
			return this.showNotice(strings('delegation.missing_delegee'));
		}
		if (!this.category) {
			return this.showNotice(strings('delegation.missing_category'));
		}

		this.addDelegation();
	}

	onCancel() {
		this.onBack();
	}

	renderDelegees = () => {
		const options = this.delegees.map(e => ({
			key: e,
			value: e
		}));

		return (
			<ModalSelector
				visible={!!this.showDelegees}
				options={options}
				hideKey={true}
				onSelect={item => {
					this.delegee = item.value;
					this.showDelegees = false;
				}}
				onClose={() => (this.showDelegees = false)}
			/>
		);
	};

	renderCategories = () => {
		const options = this.categories.map(e => ({
			key: e,
			value: e
		}));

		return (
			<ModalSelector
				visible={this.showCategories}
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

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
						<Icon name={'arrow-left'} size={16} style={styles.backIcon} />
					</TouchableOpacity>
					<NavbarTitle title={'voting.title'} disableNetwork />
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

	render() {
		const fromDate = this.fromDate;
		const toDate = this.toDate;

		return (
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'} enabled={Device.isIos()}>
				{this.renderNavBar()}
				<TrackingScrollView contentContainerStyle={{ paddingBottom: 80 }}>
					<Text style={styles.headingTitle}>{strings('voting.delegation')}</Text>
					<View style={styles.line} />

					<Text style={styles.heading}>{strings('voting.delegee')}</Text>
					{this.renderSelector({
						selected: this.delegee,
						onTap: () => (this.showDelegees = true)
					})}

					<Text style={styles.heading}>{strings('voting.category')}</Text>
					{this.renderSelector({
						selected: this.category,
						onTap: () => (this.showCategories = true)
					})}

					<Text style={styles.heading}>{strings('voting.from')}</Text>
					<View style={styles.date}>
						{
							<DateTimePicker
								value={new Date(fromDate)}
								mode={'date'}
								display={'compact'}
								onChange={(evt, date) => (this.fromDate = moment(date).format(dateFormat))}
							/>
						}
					</View>

					<Text style={styles.heading}>{strings('voting.to')}</Text>
					<View style={styles.date}>
						<DateTimePicker
							value={new Date(toDate)}
							mode={'date'}
							display={'compact'}
							onChange={(evt, date) => (this.toDate = moment(date).format(dateFormat))}
						/>
					</View>

					<View style={styles.buttons}>
						<StyledButton type={'confirm'} containerStyle={styles.save} onPress={this.onSave.bind(this)}>
							{strings('voting.save')}
						</StyledButton>
						<StyledButton type={'normal'} containerStyle={styles.cancel} onPress={this.onCancel.bind(this)}>
							{strings('voting.cancel')}
						</StyledButton>
					</View>
				</TrackingScrollView>

				{this.renderDelegees()}
				{this.renderCategories()}
			</KeyboardAvoidingView>
		);
	}
}

export default inject('store')(observer(DelegationAddEdit));
