import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
	FlatList,
	TouchableOpacity,
	StyleSheet,
	Text,
	View,
	SafeAreaView,
} from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import Device from '../../../util/Device';
import Modal from 'react-native-modal';


const styles = StyleSheet.create({
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0,
	},
	wrapper: {
		backgroundColor: colors.white,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		height: 450
	},
	heading: {
		width: '100%',
		height: 33,
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey100
	},
	dragger: {
		width: 48,
		height: 5,
		borderRadius: 4,
		backgroundColor: colors.grey400,
		opacity: Device.isAndroid() ? 0.6 : 0.5
	},
	optionList: {
		flex: 1,
	},
	option: {
		alignItems: 'center',
		paddingVertical: 20,
		marginHorizontal: 20,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	value: fontStyles.bold
});

class ModalSelector extends PureComponent {
	static propTypes = {
		/**
		 * List of key-value pair options
		 */
		options: PropTypes.array,
		/**
		 * Callback on item selected
		 */
		onSelect: PropTypes.func,
	};

	renderItem = ({ item }) => {
		const { onSelect } = this.props;

		return (
			<TouchableOpacity
				style={styles.option}
				activeOpacity={0.55}
				onPress={() => onSelect(item)}
			>
				<Text style={styles.value}>{item.value}</Text>
			</TouchableOpacity>
		);
	};

	render() {
		const { visible, options, onClose } = this.props;
		return (
			<Modal
				isVisible={visible}
				style={styles.bottomModal}
				onBackdropPress={onClose}
				onBackButtonPress={onClose}
				onSwipeComplete={onClose}
				swipeDirection={'down'}
				propagateSwipe
			>
				<SafeAreaView style={styles.wrapper}>
					<View style={styles.heading}>
						<View style={styles.dragger} />
					</View>
					<FlatList
						data={options}
						keyExtractor={(item) => item.key}
						renderItem={this.renderItem.bind(this)}
						style={styles.optionList}
					/>
				</SafeAreaView>
			</Modal>
		);
	}
}

export default ModalSelector;
