import React, { Component } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { colors } from '../../../../styles/common';
import * as FileIcons from '../../../../util/file-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import TextSpan from '../components/TextSpan';
import PartItem from '../components/PartItem';
import { strings } from '../../../../../locales/i18n';
import styles from './styles/index';
import OnboardingScreenWithBg from '../../../UI/OnboardingScreenWithBg';
import TrackingScrollView from '../../../UI/TrackingScrollView';

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
				string: strings('file.completed'),
				icon: 'done',
				color: colors.green400
			};
		case statuses.failed:
			return {
				string: strings('file.failed'),
				icon: 'replay',
				color: colors.red
			};
		case statuses.process:
			return {
				string: strings('file.in_processing'),
				icon: 'sync',
				color: colors.orange
			};
		default:
			return {
				string: strings('file.in_processing'),
				icon: 'sync',
				color: colors.orange
			};
	}
};

export { statuses, getStatusContent, formatBytes };

export default class FileDetails extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle(strings('file.details'), navigation);

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
					<TextSpan title={strings('file.total_sizes')} value={formatBytes(this.state.data.size ?? 0)} />
					<TextSpan title={strings('file.total_parts')} value={this.state.partCount} />
					<TextSpan title={strings('file.total_contacts')} value={this.state.contacts.length} />
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
		const details = this.state.details;
		const contacts = this.state.contacts;
		let parts = [];

		for (let i = 0; i < this.state.partCount; i++) {
			var foundContact;
			for (var k in details) {
				if (details[k].includes(i)) {
					foundContact = contacts.find(e => e?.address === k);
				}
			}
			parts.push(
				<PartItem
					part={{
						name: `${strings('file.part')} ${i + 1}`,
						status: this.getPartStatus(i),
						contacts: foundContact !== undefined ? [foundContact] : []
					}}
				/>
			);
			foundContact = undefined;
		}

		return (
			<View style={styles.listContainer}>
				<Text style={styles.title}>{strings('file.details')}</Text>
				{parts}
			</View>
		);
	};

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<SafeAreaView>
					<TrackingScrollView style={{ width: '100%' }}>
						<View style={styles.fileContainer}>
							{this.renderSummary()}
							{this.renderDetails()}
						</View>
					</TrackingScrollView>
				</SafeAreaView>
			</OnboardingScreenWithBg>
		);
	}
}
