import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { colors, fontStyles } from '../../../styles/common';
import Icon from 'react-native-vector-icons/FontAwesome5';
import SettingsNotification from '../SettingsNotification';
import { strings } from '../../../../locales/i18n';
import styles from './styles/index';

const propTypes = {
	title: PropTypes.string,
	/**
	 * Additional descriptive text about this option
	 */
	description: PropTypes.string,
	/**
	 * Disable bottom border
	 */
	noBorder: PropTypes.bool,
	/**
	 * Handler called when this drawer is pressed
	 */
	onPress: PropTypes.func,
	/**
	 * Display SettingsNotification
	 */
	warning: PropTypes.bool
};

const defaultProps = {
	onPress: undefined
};

const SettingsDrawer = ({ title, description, noBorder, onPress, warning }) => (
	<TouchableOpacity onPress={onPress} activeOpacity={0.6}>
		<View style={noBorder ? [styles.root, styles.noBorder] : styles.root}>
			<View style={styles.content}>
				{title && <Text style={styles.title}>{title}</Text>}
				{description && <Text style={styles.description}>{description}</Text>}
				<View>
					{warning ? (
						<SettingsNotification style={styles.warning} isWarning isNotification>
							<Text style={styles.menuItemWarningText}>{strings('drawer.settings_warning')}</Text>
						</SettingsNotification>
					) : null}
				</View>
			</View>
			<View style={styles.action}>
				<Icon name="angle-right" size={36} style={styles.icon} />
			</View>
		</View>
	</TouchableOpacity>
);

SettingsDrawer.propTypes = propTypes;
SettingsDrawer.defaultProps = defaultProps;

export default SettingsDrawer;
