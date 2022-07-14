import React, { Component } from 'react';
import { TouchableOpacity, Text, View, Modal, FlatList } from 'react-native';
import { observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import { colors } from '../../../styles/common';
import styles from './styles/index';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import TrackingTextInput from '../TrackingTextInput';
import { testID } from '../../../util/Logger';

export default class CountrySearchModal extends Component {
	searchText = '';
	rootItems = [];
	items = [];

	constructor(props) {
		super(props);
		makeObservable(this, {
			searchText: observable,
			items: observable,
			rootItems: observable
		});
		this.items = this.props.items;
		this.rootItems = this.props.items;
	}

	onSearch(text) {
		this.searchText = text;
		this.items = this.rootItems.filter(
			e =>
				(e.dialCode && e.dialCode.indexOf(this.searchText) >= 0) ||
				e.name.toLowerCase().indexOf(this.searchText.toLowerCase()) >= 0
		);
	}

	renderItem(item) {
		const { onSelectCountryCode, countryCode } = this.props;
		return (
			<TouchableOpacity
				style={styles.option}
				activeOpacity={0.1}
				onPress={() => onSelectCountryCode && onSelectCountryCode(item)}
				{...testID(`country-search-modal-country-item-${item.dialCode}`)}
			>
				<View style={styles.content}>
					<Text style={styles.dialCode} numberOfLines={1}>
						{item.dialCode ? `+${item.dialCode}` : ''}
					</Text>
					<Text style={styles.name} numberOfLines={1}>
						{item.name || ''}
					</Text>
					{countryCode === item.dialCode && <AntDesignIcon name="check" size={20} color={colors.success} />}
				</View>
			</TouchableOpacity>
		);
	}

	render() {
		const { placeholder, onClose } = this.props;
		return (
			<Modal animationType="slide" transparent>
				<TouchableOpacity style={styles.centerModal} activeOpacity={1}>
					<View style={styles.container}>
						<TouchableOpacity
							style={styles.iconClose}
							activeOpacity={0.7}
							onPress={() => onClose && onClose()}
							{...testID('country-search-modal-close-button')}
						>
							<AntDesignIcon name="closecircle" size={20} color={colors.white} />
						</TouchableOpacity>
						<View style={styles.inputView}>
							<View style={styles.inputInner}>
								<TrackingTextInput
									{...testID('country-search-search-field')}
									autoFocus={true}
									value={this.searchText}
									style={styles.search}
									placeholder={placeholder}
									placeholderTextColor={colors.grey000}
									onChangeText={e => this.onSearch(e)}
								/>
							</View>
						</View>
						<FlatList
							data={this.items}
							renderItem={({ item }) => this.renderItem(item)}
							keyExtractor={item => item.name.toString()}
						/>
					</View>
				</TouchableOpacity>
			</Modal>
		);
	}
}
observer(CountrySearchModal);
