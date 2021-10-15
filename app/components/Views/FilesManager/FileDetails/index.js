import React, { Component } from 'react';
import { View, StyleSheet, Text, ScrollView, SafeAreaView } from 'react-native';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { colors } from '../../../../styles/common';
import * as FileIcons from '../../../../util/file-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import TextSpan from '../components/TextSpan';
import PartItem from '../components/PartItem';

const statuses = {
	success: 'SUCCESS',
	failed: 'FAILED',
	process: 'PROCESSING',
	pending: 'PENDING'
};

const formatBytes = (bytes, decimals = 2) => {
	if (bytes === 0) {
		return '0 Bytes';
	}

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getStatusContent = status => {
	switch (status) {
		case statuses.success:
			return {
				string: 'Completed',
				icon: 'done',
				color: colors.green400
			};
		case statuses.failed:
			return {
				string: 'Failed',
				icon: 'replay',
				color: colors.red
			};
		case statuses.process:
			return {
				string: 'In processing',
				icon: 'sync',
				color: colors.orange
			};
		default:
			return {
				string: 'In processing',
				color: colors.orange
			};
	}
};

export { statuses, getStatusContent, formatBytes };

const fakeData = {
	parts: [
		{
			name: 'Part 1',
			status: statuses.process,
			percentages: 38,
			contacts: [
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
				}
			]
		},
		{
			name: 'Part 2',
			status: statuses.failed,
			percentages: 10,
			contacts: [
				{
					address: 'asdasdasdasdasd0Xnadasdasdvc',
					name: 'user 1'
				},
				{
					address: 'asdasdasdasdasd0Xnadasdasdfsc',
					name: 'user 2'
				}
			]
		},
		{
			name: 'Part 3',
			status: statuses.success,
			percentages: 100,
			contacts: [
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
			]
		}
	]
};

export default class FileDetails extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle('File details', navigation);

	state = {
		data: this.props.navigation.getParam('selectedFile').file,
		status: this.props.navigation.getParam('selectedFile').status,
		contacts: this.props.navigation.getParam('selectedFile').contacts,
		percent: (this.props.navigation.getParam('selectedFile').percent * 100).toFixed(1),
		partCount: this.props.navigation.getParam('selectedFile').partCount,
		details: this.props.navigation.getParam('selectedFile').details,
		currentPart: this.props.navigation.getParam('selectedFile').currentPart
	};

	renderSummary = () => {
		return (
			<View style={{ alignItems: 'center' }}>
				<View style={{ flexDirection: 'row', justifyContent: 'center' }}>
					{FileIcons.getFontAwesomeIconFromMIME(this.state.data?.type)}
					<Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
						{this.state.data?.name}
					</Text>
				</View>
				<AnimatedCircularProgress
					size={150}
					width={10}
					rotation={0}
					fill={this.state.percent}
					tintColor={getStatusContent(this.state.status).color}
					backgroundColor={colors.grey100}
					style={{ marginVertical: 20 }}
				>
					{fill => (
						<View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
							<Text style={[styles.percent, { color: getStatusContent(this.state.status).color }]}>{`${
								this.state.percent
							} %`}</Text>
							<Text style={[styles.percent, { color: getStatusContent(this.state.status).color }]}>
								{getStatusContent(this.state.status).string}
							</Text>
						</View>
					)}
				</AnimatedCircularProgress>
				<View>
					<TextSpan title="Total sizes" value={formatBytes(this.state.data.size ?? 0)} />
					<TextSpan title="Total parts" value={this.state.partCount} />
					<TextSpan title="Total contacts" value={this.state.contacts.length} />
				</View>
			</View>
		);
	};

	getPartStatus = index => {
		if (
			index < this.state.currentPart ||
			(index == this.state.currentPart && this.state.status === statuses.success)
		)
			return statuses.success;
		else if (index == this.state.currentPart && this.state.status === statuses.process) return statuses.process;
		return statuses.failed;
	};

	renderDetails = () => {
		console.log('details', this.state.details);
		console.log('partCount', this.state.partCount);

		let parts = [];
		for (let i = 0; i < this.state.partCount; i++) {
			parts.push(
				<PartItem part={{ name: `Part ${i + 1}`, status: this.getPartStatus(i), contacts: ['asdasdasdas'] }} />
			);
		}
		return (
			<View style={styles.listContainer}>
				<Text style={styles.title}>File details</Text>
				{parts}
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
