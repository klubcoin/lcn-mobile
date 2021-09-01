import React, { PureComponent } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import ModalSelector from './ModalSelector';
import contractMap from '@metamask/contract-metadata';
import AddByTokenAddress from './AddByTokenAddress';
import AddContractsERC from './AddContractsERC';
import APIService from '../../../services/APIService';
import AddCustomApps from './AddCustomApps';
import RemoteImage from '../../Base/RemoteImage';

const contracts = Object.keys(contractMap)
	.map(address => ({
		address,
		...contractMap[address],
		watchedAsset: true,
	}));

const AddTokenByAddress = () => ({
	type: 'address',
	name: strings('asset_overview.address'),
	description: 'Add token by address',
	iconUrl: 'https://docs.liquichain.io/media/app/licoin.png',
});

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	rowWrapper: {
		padding: 20
	},
	selectType: {
		flexDirection: 'row',
		borderWidth: 1,
		borderRadius: 4,
		borderColor: colors.grey100,
		alignItems: 'center'
	},
	logo: {
		width: 32,
		height: 32,
		borderRadius: 16,
		marginLeft: 10,
	},
	type: {
		flex: 1,
		padding: 16,
	},
	dropdownIcon: {
		marginHorizontal: 10,
		alignSelf: 'center',
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 4,
		borderColor: colors.grey100,
		padding: 16,
		...fontStyles.normal
	},
	warningText: {
		marginTop: 15,
		color: colors.red,
		...fontStyles.normal
	},
});

/**
 * Copmonent that provides ability to add custom tokens.
 */
export default class AddCustomTokenOrApp extends PureComponent {

	static propTypes = {
		/**
		/* navigation object required to push new views
		*/
		navigation: PropTypes.object
	};

	typeOptions = [AddTokenByAddress()];
	selectedType = this.typeOptions[0];
	showTypes = false;

	appList = [];

	constructor(props) {
		super(props);
		makeObservable(this, {
			typeOptions: observable,
			selectedType: observable,
			showTypes: observable,
			appList: observable,
		})
	}

	onBack = () => {
		this.props.navigation.goBack();
	};

	componentDidMount() {
		this.fetchApps();
	}

	fetchApps() {
		APIService.getAppList((success, json) => {
			if (success && json) {
				this.appList = [...json].filter(e => e.shortCode !== 'LIC');
				this.typeOptions = [AddTokenByAddress(), ...this.appList];
			}
		})
	}

	renderSelectTypes = () => {
		const options = this.typeOptions.map(e => ({
			key: e.shortCode,
			value: e.name,
			desc: e.description,
			icon: e.iconUrl,
		}));

		return (
			<ModalSelector
				visible={this.showTypes}
				options={options}
				onSelect={(item) => {
					this.selectedAsset = null;
					this.selectedType = this.typeOptions.find(e => e.shortCode === item.key);
					this.showTypes = false;
				}}
				onClose={() => this.showTypes = false}
			/>
		);
	};

	renderForm() {
		const { name, shortCode } = this.selectedType;
		if (name === AddTokenByAddress().name) {
			return <AddByTokenAddress
				onCancel={this.onBack.bind(this)}
				onAddToken={this.onBack.bind(this)}
			/>
		}

		switch (shortCode) {
			case 'E20':
			case 'E72':
				return <AddContractsERC
					contracts={contracts.filter((e) =>
						(e.erc20 && shortCode == 'E20') || (e.erc721 && shortCode == 'E72')
					)}
					onCancel={this.onBack.bind(this)}
					onAddToken={this.onBack.bind(this)}
				/>
			default:
				return <AddCustomApps
					selectedApp={this.selectedType}
					onCancel={this.onBack.bind(this)}
					onAddToken={this.onBack.bind(this)}
				/>
		}
	}

	renderSelectType() {
		const { name, iconUrl } = this.selectedType;

		return (
			<View style={styles.rowWrapper}>
				<Text style={fontStyles.normal}>{strings('token.select_type')}</Text>
				<TouchableOpacity
					style={styles.selectType}
					activeOpacity={0.8}
					onPress={() => this.showTypes = true}
				>
					<RemoteImage
						resizeMode={'contain'}
						source={{ uri: iconUrl }}
						style={styles.logo}
					/>
					<Text style={[fontStyles.normal, styles.type]}>
						{name}
					</Text>
					<FontAwesome
						name={'caret-down'}
						size={20}
						style={styles.dropdownIcon}
					/>
				</TouchableOpacity>
			</View>
		)
	}

	render() {
		return (
			<View style={styles.wrapper} testID={'add-custom-token-screen'}>
				{this.renderSelectType()}
				{this.renderForm()}
				{this.renderSelectTypes()}
			</View >
		);
	};
}

observer(AddCustomTokenOrApp);
