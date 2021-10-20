import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';
import Icon from 'react-native-vector-icons/FontAwesome';
import { strings } from '../../../../../locales/i18n';
import SearchBar from '../../../Base/SearchBar';

const deviceHeight = Device.getDeviceHeight();

export default function NewMessageModal({ visible, onClose }) {
	const handleSearch = value => {
		console.log(value);
	};
	return (
		<Modal transparent={true} visible={visible} animationType="fade" onDi>
			<View style={styles.background}>
				<View style={styles.container}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<TouchableOpacity onPress={onClose} style={{ flex: 1 }}>
							<Text style={styles.cancel}>Cancel</Text>
						</TouchableOpacity>
						<View style={{ flex: 5, alignItems: 'center' }}>
							<Text style={styles.title}>New message</Text>
						</View>
						<View style={{ flex: 1 }} />
					</View>
					<SearchBar placeholder={`${strings('file.search_files')}...`} value={''} onChange={handleSearch} />
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	background: {
		width: '100%',
		height: '100%',
		backgroundColor: colors.greytransparent
	},
	container: {
		width: '100%',
		height: deviceHeight - 50,
		backgroundColor: 'white',
		position: 'absolute',
		bottom: 0,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 8
	},
	cancel: {
		fontSize: 16
	},
	title: {
		fontSize: 18,
		fontWeight: '500'
	},
	searchSection: {
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
		marginLeft: 5,
		paddingVertical: 0
	}
});
