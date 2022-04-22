import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Alert, KeyboardAvoidingView } from 'react-native';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import { colors, fontStyles } from '../../../styles/common';
import CustomButton from '../../Base/CustomButton';
import LottieView from 'lottie-react-native';
import * as FilesReader from '../../../util/files-reader';
import TransferFileModal from './components/TransferFileModal';
import { connect } from 'react-redux';
import preferences from '../../../store/preferences';
import fileShareStore from '../FilesManager/store';
import FileItem from './components/FileItem';
import uuid from 'react-native-uuid';
import { SwipeRow } from 'react-native-swipe-list-view';
import Device from '../../../util/Device';
import { statuses } from './FileDetails';
import FileTransfer from './Transfer.service';
import SearchBar from '../../Base/SearchBar';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import TrackingScrollView from '../../UI/TrackingScrollView';
const swipeOffset = Device.getDeviceWidth() / 2;

class FilesManager extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle(strings('file.manger'), navigation);

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
		var results = await fileShareStore.getTransferredFiles();

		if (results) {
			this.setState(prevState => ({
				...prevState,
				localFiles: results,
				queriedFiles: results
			}));
			this.getQueriedFiles(this.state.searchQuery);
		}
	}

	onViewStatistic = file => {
		this.props.navigation.navigate('StorageStatistic');
	};

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
			await fileShareStore.saveTransferredFiles(record);
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
					await fileShareStore.deleteTransferredFile(file.id);
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
		const dataSrc = this.state.localFiles;
		let results = [];

		if (query.trim() <= 0) {
			return this.setState(prevState => ({
				...prevState,
				queriedFiles: this.state.localFiles
			}));
		}

		for (let i of dataSrc) {
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
		this.setState(prevState => ({
			...prevState,
			searchQuery: value
		}));

		this.getQueriedFiles(value);
	};

	renderFileSections = status => {
		let items;
		let title;

		if (status === statuses.process) {
			title = strings('file.in_processing');
		} else if (status === statuses.failed) {
			title = strings('file.failed_files');
		} else if (status === statuses.success) {
			title = strings('file.transferred_files');
		}

		if (status === statuses.process) {
			items = this.state.queriedFiles?.filter(e => e.status === status);
		} else {
			items = this.state.queriedFiles?.filter(e => e.status === status).reverse();
		}

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
			<OnboardingScreenWithBg screen="a">
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
						<View style={{ flex: 1, paddingHorizontal: 16 }}>
							<SearchBar
								placeholder={`${strings('file.search_files')}...`}
								value={this.state.searchQuery}
								onChange={this.handleSearch}
							/>
							<TrackingScrollView style={{ marginBottom: 100 }}>
								{this.renderFileSections(statuses.process)}
								{this.renderFileSections(statuses.failed)}
								{this.renderFileSections(statuses.success)}
							</TrackingScrollView>
							<CustomButton
								title={strings('file.transfer_other_files')}
								onPress={this.onPickFiles}
								style={styles.customButton}
							/>
						</View>
					</KeyboardAvoidingView>
				</View>
			</OnboardingScreenWithBg>
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
