import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../../../../styles/common';
import Identicon from '../../../UI/Identicon';
import FileItem from './FileItem';
import Device from '../../../../util/Device';
import CustomButton from '../../../Base/CustomButton';
import Icon from 'react-native-vector-icons/Feather';
import { strings } from '../../../../../locales/i18n';
import TrackingScrollView from '../../../UI/TrackingScrollView';

export default function TransferFileModal({
	files,
	contacts,
	selectedContacts,
	onCloseModal,
	onDeleteItem,
	onTransfer,
	onSelectContact
}) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		setVisible(files.length > 0);
	}, [files.length]);

	const onClose = () => {
		setVisible(false);
		onCloseModal();
	};

	const renderContacts = () => {
		if (contacts?.length <= 0)
			return (
				<View style={[styles.contacts, { width: '100%' }]}>
					<Text style={{ color: colors.black }}>{strings('file.no_contacts')}</Text>
				</View>
			);

		return contacts.map(e => (
			<TouchableOpacity onPress={() => onSelectContact(e)}>
				<View style={styles.contacts}>
					{selectedContacts.includes(e) ? (
						<Icon name="check-circle" size={40} style={{ color: colors.green500 }} />
					) : (
						<Identicon address={e.address} diameter={40} />
					)}

					<Text numberOfLines={1} ellipsizeMode="middle" style={{ fontSize: 14, paddingHorizontal: 10 }}>
						{e.name}
					</Text>
					<Text
						numberOfLines={1}
						ellipsizeMode="middle"
						style={{ fontSize: 14, color: colors.primaryFox, fontWeight: 'bold' }}
					>
						{e.address}
					</Text>
				</View>
			</TouchableOpacity>
		));
	};

	return (
		<Modal animationType="fade" visible={visible} onBackdropPress={onClose} style={styles.container}>
			<View style={styles.content}>
				<Text style={styles.header}>{strings('file.share_with_contacts')}</Text>
				<TrackingScrollView>
					<Text style={styles.title}>{strings('file.your_files')}</Text>
					{files?.length > 0 &&
						files.map(e => (
							<FileItem file={e} onDeleteItem={onDeleteItem} textStyle={{ color: colors.black }} />
						))}
					<Text style={styles.title}>{strings('file.contacts')}</Text>
					<TrackingScrollView horizontal>{renderContacts()}</TrackingScrollView>
				</TrackingScrollView>
				<CustomButton
					title={strings('file.transfer')}
					onPress={
						selectedContacts?.length > 0 && files?.length > 0
							? () => {
									onTransfer();
									onClose();
							  }
							: null
					}
					style={[
						styles.customButton,
						{
							backgroundColor: selectedContacts?.length > 0 ? colors.blue : colors.grey100
						}
					]}
				/>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		margin: 0,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.overlayColor
	},
	content: {
		backgroundColor: colors.white,
		width: '80%',
		height: '50%',
		borderRadius: 10,
		padding: 15,
		paddingBottom: 0
	},
	header: {
		fontWeight: 'bold',
		fontSize: 18,
		color: colors.blue,
		alignSelf: 'center'
	},
	title: {
		fontSize: 16,
		fontWeight: '500',
		marginTop: 20,
		marginBottom: 5
	},
	fileContainer: {
		paddingVertical: 5,
		flexDirection: 'row',
		alignItems: 'center'
	},
	fileName: {
		fontSize: 14,
		fontWeight: '500'
	},
	customButton: {
		maxWidth: 200,
		bottom: 20
	},
	contacts: {
		marginRight: 5,
		marginTop: 5,
		marginBottom: 50,
		width: Device.getDeviceWidth() * 0.3,
		alignItems: 'center'
	}
});
