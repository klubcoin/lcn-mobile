import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import Modal from 'react-native-modal';
import TransactionHeader from '../../../UI/TransactionHeader';
import RemoteImage from '../../../Base/RemoteImage';
import EthereumAddress from '../../../UI/EthereumAddress';
import StyledButton from '../../../UI/StyledButton';
import styles from './styles/index'
import { TextInput } from 'react-native-gesture-handler';
import { strings } from '../../../../../locales/i18n';
/**
 * Component that renders friend message overview
 */
export default class TipperModal extends PureComponent {
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
         * Typed message to be displayed to the user
         */
        data: PropTypes.object,
        /**
         * Object containing current page title and url
         */
        networkInfo: PropTypes.object
    };

    state = {
        toggleFullAddress: false,
    };

    onCancel = () => {
        this.props.hideModal();
    };

    onConfirm = () => {
        this.props.onConfirm();
        this.props.hideModal();
    };

    toggleAddress = () => {
        this.setState({ toggleFullAddress: !this.state.toggleFullAddress });
    }

    renderBody() {
        const { message, networkInfo } = this.props;

        return (
            <View style={styles.root}>
                {/* <TransactionHeader currentPageInformation={networkInfo} /> */}
                <View style={styles.heading}>
                    <Text style={styles.message}>{message}</Text>
                </View>
                <View style={{flex: 1}}>
                    {this.renderProfile()}
                    {this.renderInput()}
                </View>
                {this.renderActions()}
            </View >
        );
    }

    renderProfile() {
        const { data } = this.props;
        const { address, avatar, name, email } = data || {};

        const { toggleFullAddress } = this.state;
        const addressType = toggleFullAddress ? 'full' : 'short';

        return (
            <View style={styles.profile}>
                <View style={styles.avatarView}>
                    <RemoteImage style={styles.avatar} source={{ uri: `data:image/png;base64,${avatar}` }} />
                </View>
                <Text style={styles.name}>{name?.name || `${name}`}</Text>
                <TouchableOpacity activeOpacity={0.6} onPress={this.toggleAddress}>
                    <EthereumAddress key={addressType} style={styles.address} address={address} type={addressType} />
                </TouchableOpacity>
                <Text style={styles.email}>{email}</Text>
            </View>
        )
    }

    renderInput() {
        const { symbol, amount } = this.props;

        return (
            <View style={styles.amountInput}>
                <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="numeric"
                    multiline={true}
                    onChangeText={this.updateAmount}
                    placeholder={strings('payment_request.amount_placeholder')}
                    placeholderTextColor={colors.grey100}
                    spellCheck={false}
                    style={styles.input}
                    value={amount}
                    ref={this.amountInput}
                    testID={'request-amount-input'}
                />
                <Text style={styles.eth}>
                    {symbol}
                </Text>
            </View>

        )
    }

    renderActions() {
        const { confirmLabel, cancelLabel } = this.props;

        return (
            <View style={styles.buttons}>
                <StyledButton
                    type={'confirm'}
                    containerStyle={styles.accept}
                    onPress={this.onConfirm.bind(this)}
                >
                    {confirmLabel}
                </StyledButton>
                <StyledButton
                    type={'normal'}
                    containerStyle={styles.reject}
                    onPress={this.onCancel.bind(this)}
                >
                    {cancelLabel}
                </StyledButton>
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
