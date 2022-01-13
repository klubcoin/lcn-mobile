import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../../../../../styles/common';
import LinearGrad from '../../../../Base/LinearGrad';
import SearchBar from '../../../../Base/SearchBar';

const Search = ({ value, placeholder, onSearch, onChange }) => {
	const handleChange = text => {
		onChange && onChange(text);
	};

	const handleSearch = () => {
		onSearch && onSearch();
	};

	return (
		<View style={styles.searchBox}>
			<SearchBar
				hideIcon
				containerStyle={styles.search}
				placeholder={placeholder || 'Search...'}
				value={value}
				onChange={handleChange}
			/>
			<TouchableOpacity onPress={handleSearch} style={styles.searchButton} activeOpacity={0.6}
				testID={'search-trigger'}
				accessibilityLabel={'search-trigger'}
			>
				<LinearGrad start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }} colors={['#e88e0e', '#e83e3e']} />
				<Icon name="search" size={18} style={styles.searchIcon} />
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	searchBox: {
		marginHorizontal: 20,
		flex: 1
	},
	search: {
		borderRadius: 24,
		backgroundColor: colors.white
	},
	searchButton: {
		position: 'absolute',
		top: 18,
		right: 8,
		width: 52,
		height: 36,
		borderRadius: 18,
		overflow: 'hidden'
	},
	searchIcon: {
		position: 'absolute',
		alignSelf: 'center',
		marginVertical: 8,
		color: colors.white
	}
});

export default Search;
