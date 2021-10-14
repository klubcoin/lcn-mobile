import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { colors, fontStyles } from '../../../styles/common';
import routes from '../../../common/routes';
import Device from '../../../util/Device';
import Modal from 'react-native-modal';
import TransactionHeader from '../../UI/TransactionHeader';
import StyledButton from '../../UI/StyledButton';
import { strings } from '../../../../locales/i18n';
import { FlatList } from 'react-native-gesture-handler';
import RemoteImage from '../../Base/RemoteImage';

const styles = StyleSheet.create({
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0
	},
	root: {
		backgroundColor: colors.white,
		paddingTop: 24,
		minHeight: '90%',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingBottom: Device.isIphoneX() ? 20 : 0
	},
	heading: {
		alignItems: 'center',
		marginVertical: 24
	},
	message: {
		...fontStyles.bold,
		fontSize: 20,
		textAlign: 'center'
	},
	profile: {
		alignItems: 'center'
	},
	avatarView: {
		borderRadius: 60,
		borderWidth: 2,
		padding: 2,
		borderColor: colors.blue,
	},
	avatar: {
		width: 60,
		height: 60,
		borderRadius: 30,
		overflow: 'hidden',
		alignSelf: 'center'
	},
	name: {
		marginTop: 10,
		fontSize: 20,
		fontWeight: '600',
		color: colors.black,
		textAlign: 'center'
	},
	email: {
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center'
	},
	optionList: {
		marginTop: 30,
	},
	option: {
		marginBottom: 20,
		paddingHorizontal: 30,
	},
	desc: {
		...fontStyles.normal,
		textAlign: 'center'
	},
});

const networkInfo = {
	url: routes.mainNetWork.accountUrl,
	icon: 'logo.png',
}

const options = () => [
	strings('confirm_profile.confirm_desc'),
	strings('confirm_profile.refuse_try_again'),
	strings('confirm_profile.refuse_not_willing'),
	strings('confirm_profile.report_invalid_profile')
];

/**
 * Component that renders friend message overview
 */
export class ConfirmIdentity extends PureComponent {
	static propTypes = {
		/**
		 * flag to toggle modal's visibility
		 */
		visible: PropTypes.bool,
		/**
		 * message to show
		 */
		message: PropTypes.string,
		/**
		 * react-navigation object used for switching between screens
		 */
		navigation: PropTypes.object,
		/**
		 * Callback triggered when this message signature is rejected
		 */
		hideModal: PropTypes.func,
		/**
		 * Callback triggered when this message signature is approved
		 */
		onConfirm: PropTypes.func,
		/**
		 * User profile data
		 */
		data: PropTypes.object,
	};

	selectedIndex = -1;

	constructor(props) {
		super(props);
		makeObservable(this, {
			selectedIndex: observable,
		})
	}

	onCancel = () => {
		this.props.hideModal();
	};

	onConfirm = () => {
		this.props.onConfirm();
		this.props.hideModal();
	};

	handleOption = (index) => {
		switch (index) {
			case 0:
				break;
			case 1:
				break;
			case 2:
				break;
			case 3:
				break;
		}
	}

	renderItem = ({ item, index }) => {
		return (
			<View style={styles.option}>
				<StyledButton onPress={() => this.handleOption(index)} type={'normal'}>
					<Text style={styles.desc}>{item}</Text>
				</StyledButton>
			</View>
		)
	}

	renderBody() {
		const { message, data } = this.props;
		const { avatar, firstname, lastname, email } = data || {};
		const name = `${firstname} ${lastname}`;

		return (
			<View style={styles.root}>
				<TransactionHeader currentPageInformation={networkInfo} />
				<View style={styles.heading}>
					<Text style={styles.message}>{message}</Text>
				</View>
				<View style={styles.profile}>
					<View style={styles.avatarView}>
						<RemoteImage style={styles.avatar} source={{ uri: `data:image/png;base64,${avatar}` }} />
					</View>
					<Text style={styles.name}>{name}</Text>
					<Text style={styles.email}>{email}</Text>
				</View>
				<FlatList
					data={options()}
					keyExtractor={item => `${item}`}
					renderItem={data => this.renderItem(data)}
					style={styles.optionList}
				/>
			</View>
		)
	}

	render() {
		const { visible, hideModal } = this.props;

		return (
			<Modal
				isVisible={!!visible}
				animationIn="slideInUp"
				animationOut="slideOutDown"
				style={styles.bottomModal}
				backdropOpacity={0.7}
				animationInTiming={600}
				animationOutTiming={600}
				onBackdropPress={hideModal}
				onBackButtonPress={hideModal}
				onSwipeComplete={hideModal}
				swipeDirection={'down'}
				propagateSwipe
			>
				{this.renderBody()}
			</Modal>
		);
	}
}

export default inject('store')(observer(ConfirmIdentity));