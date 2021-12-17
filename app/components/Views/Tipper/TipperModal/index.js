import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import Modal from 'react-native-modal';
import TransactionHeader from '../../../UI/TransactionHeader';
import RemoteImage from '../../../Base/RemoteImage';
import EthereumAddress from '../../../UI/EthereumAddress';
import StyledButton from '../../../UI/StyledButton';
import styles from './styles/index'
import { strings } from '../../../../../locales/i18n';
import { action, makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import base64 from 'base-64';

export default class TipperModal extends PureComponent {
    static propTypes = {
        /**
         * flag to toggle modal's visibility
         */
        visible: PropTypes.bool,
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

    toggleFullAddress = false;
    tipData = {};

    constructor(props) {
        super(props);
        makeObservable(this, {
            toggleFullAddress: observable,
            tipData: observable,
            updateTipData: action
        })
    }

    componentDidMount() {
        this.updateTipData();
    }

    shouldComponentUpdate() {
        this.updateTipData();
        return true;
    }

    updateTipData = () => {
        const { data } = this.props;
        this.tipData = data;
    }

    onCancel = () => {
        this.props.hideModal();
    };

    onConfirm = () => {
        this.props.onConfirm();
        this.props.hideModal();
    };

    toggleAddress = () => {
        this.toggleFullAddress = !this.toggleFullAddress;
    }

    updateAmount = (value) => {
      this.tipData.amount = value;
    }

    renderBody() {
        const { recipient, meta } = this.tipData;

        const message = `${strings('tipper.tip_for', { "amount": this.tipData.amount || 0, "symbol": this.tipData.symbol, "account": recipient?.name })}?`

        return (
            <View style={styles.root}>
               {
                    meta && (<TransactionHeader currentPageInformation={meta} />)
               } 
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
        const { tipData } = this;
        const { recipient } = tipData;
        const addressType = this.toggleFullAddress ? 'full' : 'short';

        return (
            <View style={styles.profile}>
                <View style={styles.avatarView}>
                    <RemoteImage style={styles.avatar} source={{ uri: `data:image/png;base64,${recipient?.avatar}` }} />
                </View>
                <TouchableOpacity activeOpacity={0.6} onPress={this.toggleAddress}>
                    <EthereumAddress key={addressType} style={styles.address} address={recipient?.address} type={addressType} />
                </TouchableOpacity>
            </View>
        )
    }

    renderInput() {
        const { tipData } = this;
        const { symbol, amount } = tipData;

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
                    defaultValue={amount?.toString()}
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
                isVisible={visible}
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

observer(TipperModal);
