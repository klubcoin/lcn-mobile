import React, { PureComponent } from 'react';
import { StyleSheet, View, TextInput, Text, Image, TouchableHighlight, Button } from 'react-native';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors, fontStyles } from '../../../styles/common';
import CustomButton from '../../Base/CustomButton';

const files = [
	{ filename: 'Work flow.xd', size: '12.5 MB' },
	{ filename: 'Client feedback.docx', size: '29 MB' },
	{ filename: 'Playlist.docx', size: '15 MB' },
	{ filename: 'Token.docx', size: '30 MB' }
];

const fileLogo = require('../../../images/file_ic.png');
const checkFile = () => {
	console.log('check file');
};
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
						<TouchableHighlight onPress={checkFile} underlayColor={colors.grey000}>
							<View style={styles.fileContainer}>
								<Image source={fileLogo} style={{ width: 40, height: 40 }} />
								<View>
									<Text style={styles.fileName}>{e.filename}</Text>
									<Text style={styles.fileSize}>{e.size}</Text>
								</View>
							</View>
						</TouchableHighlight>
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
	fileContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderBottomColor: 'black',
		borderRadius: 10,
		padding: 10,
		marginBottom: 10
	},
	fileName: {
		fontSize: 18,
		fontWeight: '600'
	},
	fileSize: {
		fontSize: 14
	},
	customButton: {
		position: 'absolute',
		bottom: 30
	}
});
