import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import contractMap from '@metamask/contract-metadata';
import Fuse from 'fuse.js';
import Icon from 'react-native-vector-icons/FontAwesome';
import { toLowerCaseCompare } from '../../../util/general';
import TrackingTextInput from '../TrackingTextInput';

const styles = StyleSheet.create({
	searchSection: {
		margin: 20,
		marginBottom: 0,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 4,
		borderColor: colors.grey100
	},
	textInput: {
		...fontStyles.normal,
		color: colors.white
	},
	icon: {
		padding: 16
	}
});

const contractList = Object.entries(contractMap)
	.map(([address, tokenData]) => {
		tokenData.address = address;
		return tokenData;
	})
	.filter(tokenData => Boolean(tokenData.erc20));

const fuse = new Fuse(contractList, {
	shouldSort: true,
	threshold: 0.45,
	location: 0,
	distance: 100,
	maxPatternLength: 32,
	minMatchCharLength: 1,
	keys: [{ name: 'name', weight: 0.5 }, { name: 'symbol', weight: 0.5 }]
});

/**
 * PureComponent that provides ability to search assets.
 */
export default class AssetSearch extends PureComponent {
	state = {
		searchQuery: '',
		inputWidth: '85%'
	};

	static propTypes = {
		/**
		/* navigation object required to push new views
		*/
		onSearch: PropTypes.func
	};

	componentDidMount() {
		setTimeout(() => this.setState({ inputWidth: '86%' }), 100);
	}

	handleSearch = searchQuery => {
		this.setState({ searchQuery });
		const fuseSearchResult = fuse.search(searchQuery);
		const addressSearchResult = contractList.filter(token => toLowerCaseCompare(token.address, searchQuery));
		const results = [...addressSearchResult, ...fuseSearchResult];
		this.props.onSearch({ searchQuery, results });
	};

	render = () => {
		const { searchQuery, inputWidth } = this.state;

		return (
			<View style={styles.searchSection} testID={'add-searched-token-screen'}>
				<Icon name="search" size={22} style={styles.icon} color={colors.white} />
				<TrackingTextInput
					style={[styles.textInput, { width: inputWidth }]}
					value={searchQuery}
					placeholder={strings('token.search_tokens_placeholder')}
					placeholderTextColor={colors.grey300}
					onChangeText={this.handleSearch}
					testID={'input-search-asset'}
				/>
			</View>
		);
	};
}
