import React from 'react';
import { View, Text, Image } from 'react-native';
import StyledButton from '../../../../StyledButton';
import styles from './styles';

const PaymentMethodItem = ({ onBuy, displayName, image, typeText }) => {
    return (<View style={styles.card}>
        <View
            style={styles.title}
        >
            <Image
                source={image}
                style={styles.paypalIc}
                resizeMode={'contain'}
            />
            <Text style={styles.paypal}>{typeText}</Text>
        </View>
        <Text style={styles.creditCard}>With Credit/Debit Card</Text>
        <Text style={styles.fee}>Fees vary based from {typeText}.</Text>
        <View style={{ marginBottom: 5 }}>
            <StyledButton type={'white'} onPress={onBuy}>
                Buy {displayName} with {typeText}
            </StyledButton>
        </View>
    </View>);
}

export default PaymentMethodItem;