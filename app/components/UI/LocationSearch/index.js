import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { OutlinedTextField } from 'react-native-material-textfield';
import { strings } from '../../../../locales/i18n';
import APIService from '../../../services/APIService';
import { colors } from '../../../styles/common';
import styles from './styles/index';

export default function LocationSearchBar({ value }) {
	const [searchTask, setSearchTask] = useState(null);

	const onSearch = text => {
		if (searchTask) clearTimeout(searchTask);

		setSearchTask(
			setTimeout(() => {
				APIService.searchPlaces(text, null, (success, json) => {
					console.log('json.results', json);
					if (success && json.results) {
						console.log(json.results);
					}
				});
			}, 500)
		);
	};

	return (
		<View>
			<OutlinedTextField
				ref={ref => (this.inputRef = ref)}
				placeholder={strings('market.search')}
				returnKeyType="next"
				value={value || ''}//TODO: bug - value not applied
				onChangeText={text => onSearch(text)}
				baseColor={colors.grey500}
				tintColor={colors.blue}
				containerStyle={styles.input}
			/>
		</View>
	);
}
