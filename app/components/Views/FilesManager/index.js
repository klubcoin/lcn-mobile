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
	TouchableWithoutFeedback,
	Alert,
	KeyboardAvoidingView
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
import FileTransfer from './Transfer.service';

const swipeOffset = Device.getDeviceWidth() / 2;

class FilesManager extends Component {
	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(strings('drawer.file_manager'), navigation);

	FileTransferIns;

	state = {
		isLoading: false,
		selectedIds: [],
		selectedFiles: [],
		localFiles: [],
		contacts: [],
		selectedContacts: [],
		searchQuery: '',
		queriedFiles: []
	};

	constructor(props) {
		super(props);
		this.FileTransferIns = FileTransfer.getInstance();
	}

	componentDidMount() {
		const { addressBook, network } = this.props;
		const addresses = addressBook[network] || {};
		const contacts = Object.keys(addresses).map(addr => addresses[addr]);

		this.setState(prevState => ({
			...prevState,
			contacts: contacts
		}));

		this.fetchLocalFiles();
	}

	async fetchLocalFiles() {
		// await preferences.deleteTransferredFiles();
		var results = await preferences.getTransferredFiles();

		if (results) {
			this.setState(prevState => ({
				...prevState,
				localFiles: results,
				queriedFiles: results
			}));
			this.getQueriedFiles(this.state.searchQuery);
		}
	}

	onCloseModal = () => {
		this.setState(prevState => ({
			...prevState,
			selectedFiles: [],
			selectedContacts: []
		}));
	};

	onPickFiles = async () => {
		var results = await FilesReader.pickMultiple();
		this.setState(prevState => ({
			...prevState,
			selectedFiles: [...results]
		}));
	};

	onTransfer = async () => {
		const { selectedFiles, selectedContacts } = this.state;
		const { selectedAddress } = this.props;

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
				contacts: selectedContacts
			};
			this.FileTransferIns.queueFiles.push(record);
			await preferences.saveTransferredFiles(record);
		}
		this.fetchLocalFiles();
		this.FileTransferIns.startTransfer(selectedAddress, () => this.fetchLocalFiles());
	};

	onRemoveSelectedFiles = file => {
		let selectedFiles = this.state.selectedFiles;

		if (selectedFiles.includes(file)) {
			selectedFiles = this.state.selectedFiles.filter(item => item !== file);
			this.setState(prevState => ({
				...prevState,
				selectedFiles: selectedFiles
			}));
		}
	};

	onSelectContact = contact => {
		let selectedContacts = this.state.selectedContacts;

		if (selectedContacts.includes(contact)) {
			selectedContacts = this.state.selectedContacts.filter(item => item !== contact);
		} else {
			selectedContacts.push(contact);
		}
		this.setState(prevState => ({
			...prevState,
			selectedContacts: selectedContacts
		}));
	};

	onRecovery = (file, swipeValue) => {
		console.log('On recovery');
		// if (Math.abs(swipeValue.value) >= swipeOffset) console.log('on recovery');
	};

	onDelete = async (file, swipeValue) => {
		Alert.alert('Delete file', `Are you sure to delete ${file.file.name} ?`, [
			{
				text: 'Yes',
				onPress: async () => {
					if (!file) return;
					await preferences.deleteTransferredFile(file.id);
					await this.fetchLocalFiles();
				}
			},
			{
				text: 'No',
				onPress: () => console.log('No Pressed'),
				style: 'cancel'
			}
		]);
	};

	onViewDetails = file => {
		this.props.navigation.navigate('FileDetails', { selectedFile: file });
	};

	getQueriedFiles = value => {
		const query = value.toLowerCase();
		const queriedFiles = this.state.queriedFiles;
		let results = [];

		if (query.trim() <= 0) {
			return this.setState(prevState => ({
				...prevState,
				queriedFiles: this.state.localFiles
			}));
		}

		for (let i of queriedFiles) {
			if (i.file.name.toLowerCase().includes(query)) {
				results.push(i);
			}
		}

		this.setState(prevState => ({
			...prevState,
			queriedFiles: results
		}));
	};

	handleSearch = value => {
		// const queriedFiles = this.state.queriedFiles;
		const query = value.toLowerCase();
		// let results = [];

		this.setState(prevState => ({
			...prevState,
			searchQuery: query
		}));

		this.getQueriedFiles(value);

		// if (query.trim() <= 0) {
		// 	return this.setState(prevState => ({
		// 		...prevState,
		// 		queriedFiles:  this.state.localFiles,
		// 	}));
		// }

		// for (let i of queriedFiles) {
		// 	if (i.file.name.toLowerCase().includes(query)) {
		// 		results.push(i);
		// 	}
		// }

		// this.setState(prevState => ({
		// 	...prevState,
		// 	queriedFiles: results,
		// }));
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

		const items = this.state.queriedFiles?.filter(e => e.status === status);

		return (
			items.length > 0 && (
				<View style={styles.files}>
					<Text style={styles.title}>{title}</Text>
					{items.map(e => {
						const { file } = e;

						return (
							<SwipeRow
								key={e.id}
								stopRightSwipe={0}
								rightOpenValue={e.status === statuses.success ? -swipeOffset : -swipeOffset / 2}
								disableRightSwipe
								disableLeftSwipe={e.status === statuses.process}
								onRowPress={() => this.onViewDetails(e)}
							>
								<View style={styles.standaloneRowBack}>
									{e.status === statuses.success && (
										<TouchableWithoutFeedback onPress={value => this.onRecovery(file, value)}>
											<View
												style={[styles.swipeableOption, { backgroundColor: colors.green600 }]}
											>
												<Text style={{ color: colors.white, fontWeight: '700' }}>Recovery</Text>
											</View>
										</TouchableWithoutFeedback>
									)}

									<TouchableWithoutFeedback onPress={value => this.onDelete(e, value)}>
										<View style={styles.swipeableOption}>
											<Text style={{ color: colors.white, fontWeight: '700' }}>Delete</Text>
										</View>
									</TouchableWithoutFeedback>
								</View>
								<View style={styles.standaloneRowFront}>
									<FileItem file={file} date={e.date} status={e.status} processPercent={e.percent} />
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
				<KeyboardAvoidingView style={{ flex: 1 }}>
					<TransferFileModal
						files={this.state.selectedFiles}
						contacts={this.state.contacts}
						selectedContacts={this.state.selectedContacts}
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
								value={this.state.searchQuery}
								placeholder={`${strings('contacts.search')}...`}
								placeholderTextColor={colors.grey100}
								onChangeText={this.handleSearch}
							/>
						</View>
						<ScrollView style={{ marginBottom: 100 }}>
							{this.renderFileSections(statuses.process)}
							{this.renderFileSections(statuses.failed)}
							{this.renderFileSections(statuses.success)}
						</ScrollView>
						<CustomButton
							title="Transfer other files"
							onPress={this.onPickFiles}
							style={styles.customButton}
						/>
					</View>
				</KeyboardAvoidingView>
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
		backgroundColor: colors.red,
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
