import React, { PureComponent } from 'react';
import { StyleSheet, View, TextInput, Text, Image, TouchableHighlight, Button } from 'react-native';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors, fontStyles } from '../../../styles/common';
import CustomButton from '../../Base/CustomButton';
import { color } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import * as FilesReader from '../../../util/files-reader';
import { FileIcon, defaultStyles } from 'react-file-icon';
import TransferFileModal from './components/TransferFileModal';
import { connect } from 'react-redux';
import preferences from '../../../store/preferences';
import SelectedFiles from './components/SelectedFiles';
import AsyncStorage from '@react-native-community/async-storage';
import uuid from 'react-native-uuid';

class FilesManager extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle('Files manager', navigation);

	state = {
		isLoading: false,
		selectedIds: [],
		selectedFiles: [],
		transferredFiles: [],
		contacts: [],
		selectedContacts: []
	};

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const { addressBook, network } = this.props;
		const addresses = addressBook[network] || {};
		const contacts = Object.keys(addresses).map(addr => addresses[addr]);
		this.setState({ contacts: contacts });

		this.fetchTransferredFiles();
	}

	async fetchTransferredFiles() {
		var results = await preferences.getTransferredFiles();
		console.log('results', results);
		if (results) {
			this.setState({ transferredFiles: results });
		}
	}

	onCloseModal = () => {
		this.setState({ selectedFiles: [], selectedContacts: [] });
	};

	onPickFiles = async () => {
		var results = await FilesReader.pickMultiple();
		this.setState({ selectedFiles: [...results] });
	};

	onTransfer = async () => {
		const records = {
			id: uuid.v4(),
			date: Date.now(),
			files: this.state.selectedFiles,
			contacts: this.state.selectedContacts
		};
		preferences.saveTransferredFiles(records).then(_ => this.fetchTransferredFiles());
	};

	onRemoveSelectedFiles = file => {
		let selectedFiles = this.state.selectedFiles;

		if (selectedFiles.includes(file)) {
			selectedFiles = this.state.selectedFiles.filter(item => item !== file);
			this.setState({ selectedFiles: selectedFiles });
		}
	};

	onSelectContact = contact => {
		let selectedContacts = this.state.selectedContacts;

		if (selectedContacts.includes(contact)) {
			selectedContacts = this.state.selectedContacts.filter(item => item !== contact);
		} else {
			selectedContacts.push(contact);
		}
		this.setState({ selectedContacts: selectedContacts });
	};

	renderTransferredFiles = () => {
		if (this.state.transferredFiles?.length <= 0 || !this.state.transferredFiles)
			return (
				<View style={[styles.contacts, { width: '100%' }]}>
					<Text style={{ color: colors.black }}>You've not transferred any files yet</Text>
				</View>
			);
		return this.state.transferredFiles?.map(e => e.files.map(file => <SelectedFiles file={file} date={e.date} />));
	};

	render() {
		if (this.state.isLoading) {
			setTimeout(() => this.setState({ isLoading: false }), 2000);
			return <LottieView loop autoPlay source={require('../../../animations/uploading-files.json')} />;
		}

		return (
			<View style={styles.container}>
				<TransferFileModal
					files={this.state.selectedFiles}
					contacts={this.state.contacts}
					selectedContacts={this.state.selectedContacts}
					visible={this.state.viewSendFileModal}
					onDeleteItem={e => this.onRemoveSelectedFiles(e)}
					onSelectContact={e => this.onSelectContact(e)}
					onCloseModal={this.onCloseModal}
					onTransfer={this.onTransfer}
				/>
				<View style={{ flex: 1 }}>
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
						<Text style={styles.title}>Transferred files</Text>
						{this.renderTransferredFiles()}
					</View>
					<CustomButton title="Transfer other files" onPress={this.onPickFiles} style={styles.customButton} />
				</View>
			</View>
		);
	}
}

const mapStateToProps = state => ({
	addressBook: state.engine.backgroundState.AddressBookController.addressBook,
	network: state.engine.backgroundState.NetworkController.network,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	identities: state.engine.backgroundState.PreferencesController.identities
});

export default connect(mapStateToProps)(FilesManager);

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
		marginLeft: 5
	},
	files: {
		padding: 15
	},
	customButton: {
		position: 'absolute',
		bottom: 30
	},
	title: {
		fontSize: 16,
		fontWeight: '500',
		marginBottom: 5
	}
});
