import React, { Component } from 'react';
import { View, StyleSheet, Text, ScrollView, SafeAreaView } from 'react-native';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { colors } from '../../../../styles/common';
import * as FileIcons from '../../../../util/file-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import TextSpan from '../components/TextSpan';
import PartItem from '../components/PartItem';
import StorageChart from '../components/StorageChart';

export default class StorageStatistic extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle('Storage', navigation);

	render() {
		return (
			<SafeAreaView>
				<StorageChart />
			</SafeAreaView>
		);
	}
}

const styles = StyleSheet.create({
	fileContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		paddingVertical: 15,
		paddingHorizontal: 30
	},
	fileName: {
		fontSize: 18,
		fontWeight: '600',
		marginLeft: 10
	},
	percent: {
		fontSize: 14,
		fontWeight: '500'
	},
	listContainer: {
		flex: 1,
		width: '100%',
		marginTop: 30,
		alignItems: 'flex-start'
	},
	title: {
		fontSize: 16,
		fontWeight: '500',
		marginBottom: 5
	}
});
