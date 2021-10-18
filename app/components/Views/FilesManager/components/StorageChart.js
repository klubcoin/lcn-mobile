import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';

const deviceWidth = Device.getDeviceWidth();

export default function StorageChart() {
	return (
		<View style={{ flex: 1, alignItems: 'center' }}>
			<AnimatedCircularProgress
				size={deviceWidth / 2}
				width={10}
				fill={30}
				tintColor={colors.primaryFox}
				backgroundColor={colors.grey100}
				style={{ marginVertical: 20 }}
				arcSweepAngle={240}
				rotation={-120}
			/>
			<View style={styles.info}>
				<Text style={styles.percent}>30%</Text>
				<Text style={styles.detail}>30 GB of 100</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	info: {
		alignItems: 'center',
		position: 'absolute',
		top: deviceWidth / 4 - 20
	},
	percent: {
		fontSize: 24,
		fontWeight: 'bold'
	},
	detail: {
		fontSize: 16
	}
});
