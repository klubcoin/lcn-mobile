import React, { Component } from 'react';
import { View, StyleSheet, Text, ScrollView, SafeAreaView } from 'react-native';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { colors } from '../../../../styles/common';
import * as FileIcons from '../../../../util/file-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import TextSpan from '../components/TextSpan';
import PartItem from '../components/PartItem';

const fakeUser = [
	{
		address: 'asdasdasdasdasd0Xnadasdasdvc',
		name: 'user 1'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasdfsc',
		name: 'user 2'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasdr',
		name: 'user 3'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasde',
		name: 'user 4'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasdqw',
		name: 'user 5'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasdza',
		name: 'user 6'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasdccc',
		name: 'user 7'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasdvasd',
		name: 'user 8'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasdad',
		name: 'user 9'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasdaa',
		name: 'user 10'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasdaaads',
		name: 'user 11'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasdaazz',
		name: 'user 12'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasdaaas',
		name: 'user 13'
	},
	{
		address: 'asdasdasdasdasd0Xnadasdasdaaaavvadadasdasdasdasdasdasdasdasdasdassdaasdasd',
		name: 'user 14asdasdasdasdasdasdasdasdasdasdasdsadasdasdsadasds'
	}
];

export default class FileDetails extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle('File details', navigation);

	state = {
		file: this.props.navigation.getParam('selectedFile'),
		fill: 36
	};

	renderSummary = () => {
		return (
			<View style={{ alignItems: 'center' }}>
				<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
					{FileIcons.getFontAwesomeIconFromMIME(this.state.file?.type)}
					<Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
						{this.state.file?.name}
					</Text>
				</View>
				<AnimatedCircularProgress
					size={150}
					width={10}
					rotation={0}
					fill={this.state.fill}
					tintColor={colors.orange}
					backgroundColor={colors.grey100}
					style={{ marginVertical: 20 }}
				>
					{fill => (
						<View style={{ alignItems: 'center' }}>
							<Text style={styles.percent}>{`${this.state.fill} %`}</Text>
							<Text style={styles.percent}>In progressing</Text>
						</View>
					)}
				</AnimatedCircularProgress>
				<View>
					<TextSpan title="Total sizes" value="16.2 MB" />
					<TextSpan title="Total parts" value="3" />
					<TextSpan title="Total contacts" value="5" />
				</View>
			</View>
		);
	};

	renderDetails = () => {
		return (
			<View style={styles.listContainer}>
				<Text style={styles.title}>File details</Text>
				<PartItem contacts={fakeUser} />
			</View>
		);
	};

	render() {
		return (
			<SafeAreaView>
				<ScrollView style={{ width: '100%' }}>
					<View style={styles.fileContainer}>
						{this.renderSummary()}
						{this.renderDetails()}
					</View>
				</ScrollView>
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
		color: colors.orange,
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
