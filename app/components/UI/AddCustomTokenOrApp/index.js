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

const TypeOptions = () => ({
	address: strings('asset_overview.address'),
	erc20: 'ERC20',
	erc721: 'ERC721',
});
const TypeKeys = Object.keys(TypeOptions());

const contracts = Object.keys(contractMap)
	.map(address => ({
		address,
		...contractMap[address],
		watchedAsset: true,
	}));

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

	selectedType = TypeKeys[0];
	showTypes = false;

	appList = [];

	constructor(props) {
		super(props);
		makeObservable(this, {
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
				this.appList = [...json];
			}
		})
	}

	renderSelectTypes = () => {
		const options = TypeKeys.map(key => ({ key, value: TypeOptions()[key] }));

		return (
			<ModalSelector
				visible={this.showTypes}
				options={options}
				onSelect={(item) => {
					this.selectedAsset = null;
					this.selectedType = item.key;
					this.showTypes = false;
				}}
				onClose={() => this.showTypes = false}
			/>
		);
	};

	renderForm() {
		switch (this.selectedType) {
			case TypeKeys[0]:
				return <AddByTokenAddress
					onCancel={this.onBack.bind(this)}
					onAddToken={this.onBack.bind(this)}
				/>
			default:
				return <AddContractsERC
					contracts={contracts.filter((e) =>
						(e.erc20 && this.selectedType == 'erc20')
						|| (e.erc721 && this.selectedType == 'erc721')
					)}
					onCancel={this.onBack.bind(this)}
					onAddToken={this.onBack.bind(this)}
				/>
		}
	}

	renderSelectType() {
		return (
			<View style={styles.rowWrapper}>
				<Text style={fontStyles.normal}>{strings('token.select_type')}</Text>
				<TouchableOpacity
					style={styles.selectType}
					activeOpacity={0.8}
					onPress={() => this.showTypes = true}
				>
					<Text style={[fontStyles.normal, styles.type]}>
						{TypeOptions()[this.selectedType]}
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
