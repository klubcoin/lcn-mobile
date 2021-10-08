import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { colors } from '../../../../styles/common';
import FileItem from '../components/FileItem';
import * as FileIcons from '../../../../util/file-icons';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import TextSpan from '../components/TextSpan';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Progress from 'react-native-progress';
import Identicon from '../../../UI/Identicon';

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
	}
	// {
	//     address: 'asdasdasdasdasd0Xnadasdasdza',
	//     name: 'user 6',
	// }, {
	//     address: 'asdasdasdasdasd0Xnadasdasdccc',
	//     name: 'user 7',
	// }, {
	//     address: 'asdasdasdasdasd0Xnadasdasdvasd',
	//     name: 'user 8',
	// }, {
	//     address: 'asdasdasdasdasd0Xnadasdasdad',
	//     name: 'user 9',
	// }, {
	//     address: 'asdasdasdasdasd0Xnadasdasdaa',
	//     name: 'user 10',
	// }, {
	//     address: 'asdasdasdasdasd0Xnadasdasdaaads',
	//     name: 'user 11',
	// }, {
	//     address: 'asdasdasdasdasd0Xnadasdasdaazz',
	//     name: 'user 12',
	// }, {
	//     address: 'asdasdasdasdasd0Xnadasdasdaaas',
	//     name: 'user 13',
	// }, {
	//     address: 'asdasdasdasdasd0Xnadasdasdaaaavv',
	//     name: 'user 14',
	// },
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
				<View style={styles.item}>
					<View style={{ flex: 1 }}>
						<Icon name="attach-file" size={29} />
					</View>
					<View style={{ flex: 5 }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<Text style={styles.title}>Part 1 </Text>
							<Text style={[styles.title, { fontWeight: '300', color: colors.grey }]}> 30%</Text>
						</View>
						<Progress.Bar
							progress={0.3}
							width={null}
							backgroundColor={colors.grey100}
							borderWidth={0}
							color={colors.orange}
							style={{ height: 10 }}
							height={10}
						/>
						<View style={{ flexDirection: 'row' }}>
							{fakeUser.map(e => (
								<Identicon address={e.address} diameter={25} customStyle={styles.user} />
							))}
						</View>
					</View>
					<View style={{ flex: 1, alignItems: 'flex-end' }}>
						<Icon name="replay" size={29} />
					</View>
				</View>
			</View>
		);
	};

	render() {
		return (
			<View style={styles.fileContainer}>
				{this.renderSummary()}
				{this.renderDetails()}
			</View>
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
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
		backgroundColor: colors.white,
		shadowColor: colors.grey100,
		padding: 15,
		borderRadius: 5,
		shadowOffset: {
			width: 0,
			height: 3
		},
		shadowRadius: 5,
		shadowOpacity: 1.0
	},
	user: {
		marginRight: 5,
		marginTop: 5
	}
});
