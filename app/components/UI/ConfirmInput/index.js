import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView, StyleSheet, TextInput, View, } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import Text from '../../Base/Text';
import ModalDragger from '../../Base/ModalDragger';
import StyledButton from '../StyledButton';
import { strings } from '../../../../locales/i18n';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10
	},
	body: {
		alignItems: 'center',
		paddingHorizontal: 15
	},
	actionRow: {
		flexDirection: 'row',
		marginTop: 30,
		marginBottom: 30,
	},
	actionButton: {
		flex: 1,
		marginHorizontal: 8
	},
	title: {
		...fontStyles.normal,
		color: colors.fontPrimary,
		fontSize: 18,
		flexDirection: 'row',
		alignSelf: 'center'
	},
	message: {
		...fontStyles.normal,
		color: colors.fontPrimary,
		fontSize: 16,
		flexDirection: 'row',
		alignSelf: 'center',
		marginTop: 10,
	},
	titleWrapper: {
		marginTop: 10
	},
	input: {
		width: '100%',
		height: 40,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 4,
		marginTop: 10,
		paddingHorizontal: 10,
	}
});

/**
 * PureComponent that renders confirm actions
 */
export default class ConfirmInput extends PureComponent {
	static propTypes = {
		title: PropTypes.string,
		message: PropTypes.string,
		confirmLabel: PropTypes.string,
		cancelLabel: PropTypes.string,
		onConfirm: PropTypes.func,
		hideModal: PropTypes.func,
	};

	state = {
		value: this.props.value
	};

	onConfirm() {
		const { onConfirm, hideModal } = this.props;
		const { value } = this.state;

		hideModal && hideModal();
		onConfirm && onConfirm(value);
	}

	onCancel() {
		const { hideModal } = this.props;
		hideModal && hideModal();
	}

	onChange = (text) => {
		this.setState({ value: text })
	}

	render() {
		const { title, message, placeholder, confirmLabel, cancelLabel } = this.props;
		const { value } = this.state;

		return (
			<SafeAreaView style={styles.wrapper}>
				<ModalDragger />
				<View style={styles.titleWrapper}>
					<Text style={styles.title}>{title}</Text>
					{!!message &&
						<Text style={styles.message} >
							{message}
						</Text>
					}
				</View>
				<View style={styles.body}>
					<TextInput
						autoCapitalize='sentences'
						autoCorrect={false}
						onChangeText={this.onChange}
						placeholder={placeholder || '...'}
						placeholderTextColor={colors.grey100}
						spellCheck={false}
						style={styles.input}
						value={value}
						numberOfLines={1}
					/>
					<View style={styles.actionRow}>
						<StyledButton
							type={'normal'}
							onPress={this.onCancel.bind(this)}
							containerStyle={styles.actionButton}
						>
							{cancelLabel || strings('action_view.cancel')}
						</StyledButton>
						<StyledButton
							type={'confirm'}
							onPress={this.onConfirm.bind(this)}
							containerStyle={styles.actionButton}
						>
							{confirmLabel || strings('action_view.confirm')}
						</StyledButton>
					</View>
				</View>
			</SafeAreaView>
		);
	}
}
