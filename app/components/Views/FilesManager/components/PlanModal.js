import React from 'react';
import { View, Text, Modal, SafeAreaView, StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';
import CustomButton from '../../../Base/CustomButton';

const deviceWidth = Device.getDeviceWidth();

const plans = [
	{
		size: '20GB',
		speed: '45 bps',
		desc: 'Billed monthly'
	},
	{
		size: '20GB',
		speed: '45 bps',
		desc: 'Billed monthly'
	},
	{
		size: '20GB',
		speed: '45 bps',
		desc: 'Billed monthly'
	},
	{
		size: '20GB',
		speed: '45 bps',
		desc: 'Billed monthly'
	}
];

export default function PlanModal() {
	return (
		<Modal visible={false}>
			<SafeAreaView style={{ flex: 1 }}>
				<View style={{ paddingHorizontal: 16 }}>
					<Text style={styles.header}>Would you like to upgrade?</Text>
					<Text style={{ fontSize: 16, marginVertical: 10 }}>Your storage ran out 30% now</Text>
					<Text style={styles.title}>Your plan</Text>
					<View style={styles.infoCard}>
						<View>
							<Text style={{ fontWeight: '600', fontSize: 16 }}>10 GB</Text>
							<Text style={{ marginVertical: 5 }}>Transfer at 30bps</Text>
							<Text>Billed monthly</Text>
						</View>
						<Text style={{ fontWeight: '600', fontSize: 16 }}>$23.00</Text>
					</View>
					<Text style={styles.title}>Upgrade to</Text>
					<View style={styles.verticalCard}>
						<View>
							<Text style={{ fontWeight: '600', fontSize: 16 }}>10 GB</Text>
							<Text style={{ marginVertical: 5 }}>Transfer at 30bps</Text>
							<Text>Billed monthly</Text>
						</View>
						<Text style={{ fontWeight: '600', fontSize: 16 }}>$23.00</Text>
					</View>
				</View>
				<CustomButton title="Upgrade now" onPress={() => console.log('Upgrade')} style={styles.customButton} />
			</SafeAreaView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	header: {
		fontSize: 18,
		fontWeight: '600',
		alignSelf: 'center'
	},
	title: {
		fontSize: 16,
		color: colors.grey400,
		fontWeight: '500',
		marginVertical: 10
	},
	infoCard: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		backgroundColor: colors.primaryFox100,
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 5,
		borderWidth: 2,
		borderColor: colors.primaryFox
	},
	customButton: {
		position: 'absolute',
		bottom: 30
	},
	verticalCard: {
		width: deviceWidth / 3,
		paddingVertical: 10,
		paddingHorizontal: 15,
		borderRadius: 5,
		borderWidth: 2,
		borderColor: colors.primaryFox
	}
});
