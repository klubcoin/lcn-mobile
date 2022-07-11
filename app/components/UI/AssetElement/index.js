import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors } from '../../../styles/common';
import Icon from 'react-native-vector-icons/FontAwesome';
import Colors from 'common/colors';
import { testID } from '../../../util/Logger';
const styles = StyleSheet.create({
	itemWrapper: {
		flex: 1,
		flexDirection: 'row',
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.grey100
	},
	arrow: {
		flex: 1,
		alignSelf: 'flex-end'
	},
	arrowIcon: {
		marginTop: 16
	}
});

/**
 * Customizable view to render assets in lists
 */
export default class AssetElement extends PureComponent {
	static propTypes = {
		/**
		 * Content to display in the list element
		 */
		children: PropTypes.node,
		/**
		 * Object being rendered
		 */
		asset: PropTypes.object,
		/**
		 * Callback triggered on long press
		 */
		onPress: PropTypes.func,
		/**
		 * Callback triggered on long press
		 */
		onLongPress: PropTypes.func
	};

	handleOnPress = () => {
		const { onPress, asset } = this.props;
		onPress && onPress(asset);
	};

	handleOnLongPress = () => {
		const { onLongPress, asset } = this.props;
		onLongPress && onLongPress(asset);
	};

	render = () => {
		const { children, testID: testId } = this.props;
		return (
			<TouchableOpacity
				onPress={this.handleOnPress}
				onLongPress={this.handleOnLongPress}
				style={styles.itemWrapper}
				{...testID(testId)}
			>
				{children}
				<View styles={styles.arrow}>
					<Icon name="chevron-right" size={20} color={colors.blue} style={styles.arrowIcon} />
				</View>
			</TouchableOpacity>
		);
	};
}
