import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Progress from 'react-native-progress';
import Identicon from '../../../UI/Identicon';
import { colors } from '../../../../styles/common';
import { getStatusContent } from '../FileDetails';

export default function PartItem({ part }) {
	const [viewMore, setViewMore] = useState(false);
	const { name, status, percentages, contacts } = part;

	const onViewMore = () => {
		setViewMore(!viewMore);
	};

	if (!part) return;

	return (
		<View style={{ width: '100%', marginVertical: 5 }}>
			<TouchableOpacity style={styles.container} onPress={onViewMore}>
				<View style={{ flex: 1 }}>
					<Icon name="attach-file" size={29} />
				</View>
				<View style={{ flex: 5 }}>
					<View style={{ flexDirection: 'row' }}>
						<Text style={styles.title}>{name} </Text>
						<Text style={{ color: getStatusContent(status).color }}>{`(${
							getStatusContent(status).string
						})`}</Text>
					</View>
					<View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
						<View style={{ flexDirection: 'row' }}>
							{contacts.length > 0 &&
								contacts !== undefined &&
								contacts.map(
									e =>
										contacts.indexOf(e) < 5 && (
											<Identicon address={e.address} diameter={25} customStyle={styles.user} />
										)
								)}
						</View>
						{/* <Text style={{ marginLeft: 10 }}>...View more</Text> */}
					</View>
				</View>
				<View style={{ flex: 1, alignItems: 'flex-end' }}>
					<Icon
						name={getStatusContent(status).icon}
						size={22}
						style={{ color: getStatusContent(status).color }}
					/>
				</View>
			</TouchableOpacity>
			{contacts.length > 0 && viewMore && (
				<View style={[styles.container, { marginTop: 10, maxHeight: 200 }]}>
					<ScrollView>
						{contacts.length > 0 &&
							contacts !== undefined &&
							contacts.map(e => (
								<View style={{ flexDirection: 'row', marginVertical: 5 }}>
									<Identicon address={e.address} diameter={25} customStyle={styles.user} />
									<View>
										<Text
											style={{ fontWeight: '700', maxWidth: 100 }}
											numberOfLines={1}
											ellipsizeMode="middle"
										>
											{e.name}
										</Text>
										<Text style={{ maxWidth: 250 }} numberOfLines={1} ellipsizeMode="middle">
											{e.address}
										</Text>
									</View>
								</View>
							))}
					</ScrollView>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
		backgroundColor: colors.white,
		shadowColor: colors.grey100,
		padding: 15,
		borderRadius: 5,
		shadowOffset: {
			width: 0,
			height: 3
		},
		shadowRadius: 5,
		shadowOpacity: 1.0
	},
	user: {
		marginRight: 5,
		marginTop: 5
	}
});
