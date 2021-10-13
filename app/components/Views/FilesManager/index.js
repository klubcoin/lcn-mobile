import React, { PureComponent } from 'react';
import {
	StyleSheet,
	View,
	TextInput,
	Text,
	Image,
	TouchableHighlight,
	Button,
	ScrollView,
	DeviceEventEmitter,
	TouchableWithoutFeedback
} from 'react-native';
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
import FileItem from './components/FileItem';
import uuid from 'react-native-uuid';
import { SwipeRow } from 'react-native-swipe-list-view';
import Device from '../../../util/Device';
import * as RNFS from 'react-native-fs';
import FileTransferWebRTC from '../../../services/FileTransferWebRTC';
import { refWebRTC } from '../../../services/WebRTC';
import { statuses } from './FileDetails';
import { process } from 'babel-jest';

const swipeOffset = Device.getDeviceWidth() / 2;

const updatePreference = async (selectedFile, status) => {
	var localFiles = await preferences.getTransferredFiles();
	var file;
	if (localFiles) file = localFiles.find(e => e.id === selectedFile.id);
	else {
		file = selectedFile;
		localFiles.push(selectedFile);
	}

	switch (status) {
		case statuses.process:
			file.status = statuses.process;
			break;
		case statuses.success:
			file.status = statuses.success;
			break;
		case statuses.failed:
			file.status = statuses.failed;
			break;
		default:
			break;
	}
	await preferences.saveTransferredFiles(localFiles);
	//check preference => update file status, percent with same uuid
	// move to next file
};

class FilesManager extends Component {
	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(strings('drawer.files_manager'), navigation);

	state = {
		isLoading: false,
		selectedIds: [],
		selectedFiles: [],
		localFiles: [],
		processFiles: [],
		transferredFiles: [],
		failedFiles: [],
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

		this.fetchLocalFiles();
	}

	async fetchLocalFiles() {
		// await preferences.deleteTransferredFiles();
		var results = await preferences.getTransferredFiles();

		if (results) {
			this.setState({
				localFiles: results
			});
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
		const { selectedFiles } = this.state;
		const date = Date.now();
		const files = [];

		for (var index in selectedFiles) {
			const file = selectedFiles[index];
			const record = {
				id: uuid.v4(),
				status: statuses.process,
				percent: 0,
				date,
				file,
				contacts: this.state.selectedContacts
			};
			files.push(record);
			await preferences.saveTransferredFiles(record);
		}
		this.fetchLocalFiles();
		this.startTransfer(files);
	};

	startTransfer = async files => {
		const { selectedAddress } = this.props;
		const webrtc = refWebRTC();

		const file = files[0];

		const addresses = file.contacts.map(e => e.address);
		const content = await RNFS.readFile(file.file.uri.replace('file://', ''), 'base64');
		const lookupName = file.file.name;

		updatePreference(file, statuses.process);
		this.fetchLocalFiles();

		FileTransferWebRTC.sendAsParts(content, lookupName, selectedAddress, addresses, webrtc);
		const statsEvent = DeviceEventEmitter.addListener('FileTransStat', stats => {
			const { completed, name, error } = stats;

			if (completed && name == lookupName) {
				// TODO: check and send next file
				updatePreference(file, statuses.success);
				this.fetchLocalFiles();
				statsEvent.remove(); // remove if done
			} else if (error && name == lookupName) {
				const { peer, partCount, currentPart } = stats;
				updatePreference(file, statuses.failed);
				this.fetchLocalFiles();

				alert(`Error: Failed to send ${currentPart}/${partCount} of ${lookupName} to ${peer}`);
				// TODO: check and send next file
				statsEvent.remove(); // remove if done
			}
		});
	};

	onRemoveSelectedFiles = file => {
		let selectedFiles = this.state.selectedFiles;

		if (selectedFiles.includes(file)) {
			selectedFiles = this.state.selectedFiles.filter(item => item !== file);
			this.setState({ selectedFiles });
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

	onRecovery = (file, swipeValue) => {
		console.log('On recovery');
		// if (Math.abs(swipeValue.value) >= swipeOffset) console.log('on recovery');
	};

	onDelete = (file, swipeValue) => {
		console.log('On delete');
		// if (Math.abs(swipeValue.value) >= swipeOffset) console.log('on recovery');
	};

	onViewDetails = file => {
		this.props.navigation.navigate('FileDetails', { selectedFile: file });
	};

	renderFileSections = status => {
		let title;
		if (status === statuses.process) {
			title = 'In processing';
		} else if (status === statuses.failed) {
			title = 'Failed files';
		} else if (status === statuses.success) {
			title = 'Transferred files';
		}

		const items = this.state.localFiles?.filter(e => e.status === status);

		return (
			items.length > 0 && (
				<View style={styles.files}>
					<Text style={styles.title}>{title}</Text>
					{items.map(e => {
						const { file } = e;

						return (
							<SwipeRow
								stopRightSwipe={0}
								rightOpenValue={-swipeOffset}
								disableRightSwipe
								disableLeftSwipe={e.status !== statuses.success}
								onRowPress={() => this.onViewDetails(file)}
							>
								<View style={styles.standaloneRowBack}>
									<TouchableWithoutFeedback onPress={value => this.onRecovery(file, value)}>
										<View style={[styles.swipeableOption, { backgroundColor: colors.green600 }]}>
											<Text style={{ color: colors.white, fontWeight: '700' }}>Recovery</Text>
										</View>
									</TouchableWithoutFeedback>

									<TouchableWithoutFeedback onPress={value => this.onDelete(file, value)}>
										<View style={styles.swipeableOption}>
											<Text style={{ color: colors.white, fontWeight: '700' }}>Delete</Text>
										</View>
									</TouchableWithoutFeedback>
								</View>
								<View style={styles.standaloneRowFront}>
									<FileItem
										file={file}
										date={e.date}
										processPercent={e.status === statuses.process && 30}
									/>
								</View>
							</SwipeRow>
						);
					})}
				</View>
			)
		);
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
					<ScrollView style={{ marginBottom: 80 }}>
						{this.renderFileSections(statuses.process)}
						{this.renderFileSections(statuses.failed)}
						{this.renderFileSections(statuses.success)}
					</ScrollView>
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
	},
	standaloneRowBack: {
		alignItems: 'center',
		backgroundColor: colors.green600,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-end'
	},
	standaloneRowFront: {
		backgroundColor: colors.white,
		justifyContent: 'center'
	},
	swipeableOption: {
		width: swipeOffset / 2,
		alignItems: 'center',
		backgroundColor: colors.red,
		height: '100%',
		justifyContent: 'center'
	}
});
