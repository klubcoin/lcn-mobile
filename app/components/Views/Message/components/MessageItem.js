import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';
import Identicon from '../../../UI/Identicon';

export default function MessageItem() {
	return (
		<View style={styles.container}>
			<Identicon address={'selectedAddress'} diameter={35} />
			<View style={{ flex: 10, marginHorizontal: 8 }}>
				<Text style={styles.address}>0xFFasdasd....128a</Text>
				<View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
					<Text style={styles.message} numberOfLines={1}>
						Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been
						the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley
						of type and scrambled it to make a type specimen book.
					</Text>
					<Text style={styles.time}>11:15pm</Text>
				</View>
			</View>
			<View style={{ flex: 1, marginHorizontal: 8 }}>
				<View style={styles.hasMessage} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 16,
		flexDirection: 'row'
	},
	address: {
		fontSize: 16,
		fontWeight: '400'
	},
	message: {
		textAlign: 'justify',
		flex: 3,
		color: colors.grey400,
		fontWeight: '300',
		fontSize: 14
	},
	time: {
		flex: 1,
		marginLeft: 10,
		color: colors.grey400,
		fontWeight: '300',
		fontSize: 14
	},
	hasMessage: {
		position: 'absolute',
		top: 8,
		right: 0,
		width: 10,
		height: 10,
		borderRadius: 10,
		backgroundColor: colors.primaryFox
	}
});
