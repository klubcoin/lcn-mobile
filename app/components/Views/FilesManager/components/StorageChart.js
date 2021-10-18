import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';
import Ionicons from 'react-native-vector-icons/Ionicons';

const deviceWidth = Device.getDeviceWidth();

export default function StorageChart() {
	const onViewPrice = () => {
		console.log('view price');
	};

	return (
		<View style={{ flex: 1, alignItems: 'center' }}>
			<View>
				<AnimatedCircularProgress
					size={deviceWidth / 2}
					width={10}
					fill={30}
					tintColor={colors.primaryFox}
					backgroundColor={colors.grey100}
					style={{
						marginVertical: 20,
						alignSelf: 'center'
					}}
					arcSweepAngle={240}
					rotation={-120}
				/>
				<View style={styles.info}>
					<Text style={styles.percent}>30%</Text>
					<Text style={styles.detail}>30 GB of 100</Text>
				</View>
				<View style={{ height: 50, width: 50, position: 'absolute', right: -20, top: 15 }}>
					<TouchableOpacity onPress={onViewPrice}>
						<Ionicons
							color={colors.black}
							size={28}
							style={styles.fixCenterIcon}
							name="information-circle-outline"
						/>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	info: {
		alignItems: 'center',
		position: 'absolute',
		top: deviceWidth / 4 - 20,
		alignSelf: 'center'
	},
	percent: {
		fontSize: 24,
		fontWeight: 'bold'
	},
	detail: {
		fontSize: 16
	},
	icon: {
		color: colors.primaryFox,
		marginTop: 50
	}
});
