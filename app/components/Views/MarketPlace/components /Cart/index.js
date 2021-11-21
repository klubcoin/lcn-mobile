import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { inject, observer } from 'mobx-react';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import styles from './styles';

const Cart = ({ market, color, onPress }) => {
	return (
		<View style={styles.cart}>
			<TouchableOpacity onPress={() => onPress && onPress()} style={styles.button}>
				<IonIcon style={styles.cartIcon} name={'cart-outline'} size={RFValue(18)} color={color} />
				{market.cartBadge > 0 && (
					<View style={styles.badge}>
						<Text style={styles.counter}>{market.cartBadge}</Text>
					</View>
				)}
			</TouchableOpacity>
		</View>
	)
}

export default inject('market')(observer(Cart));
