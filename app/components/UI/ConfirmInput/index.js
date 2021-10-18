import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { KeyboardAvoidingView, SafeAreaView, StyleSheet, TextInput, View } from 'react-native';
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
		marginBottom: 30
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
		paddingHorizontal: 10
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
		paddingHorizontal: 10
	},
	error: {
		borderColor: '#f00',
		borderWidth: 1
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
		hideModal: PropTypes.func
	};

	state = {
		value: this.props.value,
		typed: false
	};

	onConfirm() {
		const { onConfirm, hideModal } = this.props;
		const { value } = this.state;
		this.setState({ typed: true });

		if (!value || value.length == 0) return;

		hideModal && hideModal();
		onConfirm && onConfirm(value);
	}

	onCancel() {
		const { hideModal } = this.props;
		hideModal && hideModal();
	}

	onChange = text => {
		this.setState({ value: text, typed: true });
	};

	render() {
		const { title, message, multiline, placeholder, confirmLabel, cancelLabel } = this.props;
		const { value, typed } = this.state;
		const empty = typed && value.length == 0;

		return (
			<KeyboardAvoidingView behavior={'padding'}>
				<SafeAreaView style={styles.wrapper}>
					<ModalDragger />
					<View style={styles.titleWrapper}>
						<Text style={styles.title}>{title}</Text>
						{!!message && <Text style={styles.message}>{message}</Text>}
					</View>
					<View style={styles.body}>
						<TextInput
							autoCapitalize="sentences"
							autoCorrect={false}
							onChangeText={this.onChange}
							placeholder={placeholder || '...'}
							placeholderTextColor={colors.grey100}
							spellCheck={false}
							style={[styles.input, empty && styles.error]}
							value={value}
							multiline={!!multiline}
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
			</KeyboardAvoidingView>
		);
	}
}
