import React, { PureComponent } from 'react';
import { StyleSheet, View, TextInput, Text, Image, TouchableHighlight, Button } from 'react-native';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors, fontStyles } from '../../../styles/common';
import CustomButton from '../../Base/CustomButton';
import { color } from 'react-native-reanimated';
import FileItem from './components/FileItem';

const files = [
	{ id: 0, filename: 'Work flow.xd', size: '12.5 MB', date: '10 Sep, 11:23 pm' },
	{ id: 1, filename: 'Client feedback.docx', size: '29 MB', date: '15 Oct, 10:20 am' },
	{ id: 2, filename: 'Playlist.docx', size: '15 MB', date: '30 Nov, 03:23 pm' },
	{ id: 3, filename: 'Token.docx', size: '30 MB', date: '12 Dec, 12:23 pm' }
];

export default class FilesManager extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle('Files manager', navigation);

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.searchSection}>
					<Icon name="search" size={22} style={styles.icon} />
					<TextInput
						style={styles.textInput}
						value={''}
						placeholder={`${strings('contacts.search')}...`}
						placeholderTextColor={colors.grey100}
						onChangeText={this.handleSearch}
					/>
				</View>
				<View style={styles.files}>
					{files.map(e => (
						<FileItem item={e} />
					))}
				</View>
				<CustomButton title="Back up now" onPress={() => console.log('hello')} style={styles.customButton} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	header: {
		height: '30%',
		borderRadius: 30
	},
	searchSection: {
		marginHorizontal: 20,
		marginVertical: 10,
		padding: 10,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.grey100
	},
	textInput: {
		flex: 1,
		height: 30,
		...fontStyles.normal
	},
	files: {
		padding: 15
	},
	customButton: {
		position: 'absolute',
		bottom: 30
	}
});
