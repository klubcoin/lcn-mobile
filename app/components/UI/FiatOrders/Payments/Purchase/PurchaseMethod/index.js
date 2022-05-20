import React from 'react';
import { View, Text, Image } from 'react-native';
import { strings } from '../../../../../../../locales/i18n';
import StyledButton from '../../../../StyledButton';
import styles from './styles';

const PaymentMethodItem = ({ onBuy, displayName, image, typeText }) => {
	return (
		<View style={styles.card}>
			<View style={styles.title}>
				<View style={styles.imageContainer}>
					<Image source={image} style={styles.paypalIc} resizeMode={'contain'} />
				</View>
				<Text style={styles.paypal}>{typeText}</Text>
			</View>
			<Text style={styles.creditCard}>{strings('payment_request.with_credit_card')}</Text>
			<Text style={styles.fee}>{strings('payment_request.base_from', { typeText })}</Text>
			<View style={{ marginBottom: 5 }}>
				<StyledButton testID={'purchase-method-component-buy-button'} type={'white'} onPress={onBuy}>
					{strings('payment_request.buy_with', { typeText, displayName })}
				</StyledButton>
			</View>
		</View>
	);
};

export default PaymentMethodItem;
