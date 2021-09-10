import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { SafeAreaView, StyleSheet, View, } from 'react-native';
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
	subMessage: {
		...fontStyles.normal,
		color: colors.fontPrimary,
		fontSize: 14,
		flexDirection: 'row',
		alignSelf: 'center',
		marginTop: 10,
	},
	titleWrapper: {
		marginTop: 10
	}
});

/**
 * PureComponent that renders confirm actions
 */
export default class ConfirmLogout extends PureComponent {
	static propTypes = {
		title: PropTypes.string,
		message: PropTypes.string,
		subMessage: PropTypes.string,
		confirmLabel: PropTypes.string,
		cancelLabel: PropTypes.string,
		onConfirm: PropTypes.func,
		hideModal: PropTypes.func,
	};

	constructor(props) {
		super(props)
		console.log(props)
	}

	onConfirm() {
		const { onConfirm, hideModal } = this.props;
		hideModal && hideModal();
		onConfirm && onConfirm();
	}

	onCancel() {
		const { hideModal } = this.props;
		hideModal && hideModal();
	}

	render() {
		const { title, message, subMessage, confirmLabel, cancelLabel } = this.props;
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
					{!!subMessage &&
						<Text style={styles.subMessage} >
							{subMessage}
						</Text>
					}
				</View>
				<View style={styles.body}>
					<View style={styles.actionRow}>
						<StyledButton
							type={'danger'}
							onPress={this.onConfirm.bind(this)}
							containerStyle={styles.actionButton}
						>
							{confirmLabel || strings('action_view.confirm')}
						</StyledButton>

						<StyledButton
							type={'normal'}
							onPress={this.onCancel.bind(this)}
							containerStyle={styles.actionButton}
						>
							{cancelLabel || strings('action_view.cancel')}
						</StyledButton>
					</View>
				</View>
			</SafeAreaView>
		);
	}
}
