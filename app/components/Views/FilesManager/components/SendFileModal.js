import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { colors } from '../../../../styles/common';
import Identicon from '../../../UI/Identicon';
import SelectedFiles from './SelectedFiles';
import Device from '../../../../util/Device';
import CustomButton from '../../../Base/CustomButton';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';

export default function SendFileModal({
	files,
	contacts,
	selectedContacts,
	onCloseModal,
	onDeleteItem,
	onBackup,
	onSelectContact
}) {
	const [visible, setVisible] = useState(false);
	console.log('selected contacts', selectedContacts.length);

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
					<Text style={{ color: colors.black }}>You do not have any contacts</Text>
				</View>
			);

		return contacts.map(e => (
			<TouchableOpacity onPress={() => onSelectContact(e)}>
				<View style={[styles.contacts]}>
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
				<Text style={styles.header}>Share with contacts</Text>
				<ScrollView>
					<Text style={styles.title}>Your files</Text>
					{files?.length > 0 && files.map(e => <SelectedFiles file={e} onDeleteItem={onDeleteItem} />)}
					<Text style={styles.title}>Contacts</Text>
					<ScrollView horizontal>{renderContacts()}</ScrollView>
				</ScrollView>
				<CustomButton
					title="Backup"
					onPress={contacts?.length > 0 ? this.onBackup : null}
					style={[
						styles.customButton,
						{
							backgroundColor: contacts?.length > 0 ? colors.primaryFox : colors.grey100
						}
					]}
				/>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		margin: 0, // This is the important style you need to set
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.greytransparent100
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
		color: colors.primaryFox,
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
