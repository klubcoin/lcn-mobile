import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicon from 'react-native-vector-icons/Ionicons';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import FoundationIcon from 'react-native-vector-icons/Foundation';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { colors } from '../../../styles/common';
import Device from '../../../util/Device';
import Icon from 'react-native-vector-icons/FontAwesome';
import Text from '../../Base/Text';
import Colors from 'common/colors';
import styles from './styles/index';
import drawables from '../../../common/drawables';

function getImageIcon(name) {
	return <Image source={drawables[name]} style={styles.imageIcon} resizeMode={'contain'} />;
}

function getIcon(type) {
	switch (type) {
		case 'send': {
			return <Icon name={'share-square-o'} size={25} style={styles.buttonIcon} />;
		}
		case 'receive': {
			return (
				<FontAwesome5Icon
					name={'hand-holding-usd'}
					size={25}
					color={colors.white}
					style={[styles.buttonIcon]}
				/>
			);
		}
		case 'add': {
			return <Ionicon name="ios-add" size={30} style={styles.buttonIcon} />;
		}
		case 'information': {
			return <Ionicon name="md-information" size={30} style={styles.buttonIcon} />;
		}
		case 'swap': {
			return <MaterialCommunityIcon name="repeat" size={22} style={[styles.buttonIcon, styles.swapsIcon]} />;
		}
		case 'buy': {
			return <Ionicon name="wallet-outline" size={25} style={[styles.buttonIcon, styles.buyIcon]} />;
		}
		default: {
			return null;
		}
	}
}

function getLabelIcon(type) {
	switch (type) {
		case 'send': {
			return <FeatherIcon name={'arrow-up'} size={20} style={styles.buttonIcon} />;
		}
		case 'receive': {
			return <FeatherIcon name={'arrow-down'} size={20} color={colors.white} style={styles.buttonIcon} />;
		}
		case 'add': {
			return <Ionicon name="ios-add" size={30} style={styles.buttonIcon} />;
		}
		case 'information': {
			return <Ionicon name="md-information" size={30} style={styles.buttonIcon} />;
		}
		case 'swap': {
			return <MaterialCommunityIcon name="repeat" size={22} style={[styles.buttonIcon, styles.swapsIcon]} />;
		}
		case 'buy': {
			return <FoundationIcon name="dollar" size={22} style={[styles.buttonIcon, styles.buyIcon]} />;
		}
		default: {
			return null;
		}
	}
}

function AssetActionButton({ onPress, icon, label, disabled, lastIcon = false }) {
	return (
		<TouchableOpacity
			onPress={onPress}
			style={[styles.button, disabled && styles.disabledButton, { marginRight: lastIcon ? 0 : 6 }]}
			disabled={disabled}
			activeOpacity={0.6}
		>
			<View style={styles.buttonIconWrapper}>
				{icon && (typeof icon === 'string' ? getImageIcon(icon) : icon)}
			</View>
			<View style={styles.textWrapperStyle}>
				{/* {getLabelIcon(icon)} */}
				<Text centered style={styles.buttonText} numberOfLines={1}>
					{label}
				</Text>
			</View>
		</TouchableOpacity>
	);
}

AssetActionButton.propTypes = {
	onPress: PropTypes.func,
	icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
	label: PropTypes.string,
	disabled: PropTypes.bool
};

export default AssetActionButton;
