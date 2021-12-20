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
import routes from '../../../../common/routes';
import Api from '../../../../services/api';
import { renderFromWei, toWei, toTokenMinimalUnit, fromWei } from '../../../../util/number';
import Engine from '../../../../core/Engine';
import { getTicker } from '../../../../util/transactions';

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

    updateTipData = () => {
        const { data } = this.props;
        const { receiverAddress } = data;
        this.getWalletInfo(receiverAddress);
        this.tipData = data;
    }

    getWalletInfo(address) {
        if (!address) return;
        Api.postRequest(
            routes.walletInfo,
            [address],
            response => {
                if (response.result) {
                    const { name } = response.result;
                    this.tipData.name = name;
                }
            },
            error => {
                console.warn('error', error);
            }
        );
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
        if (!value) value = 0;
        const { isETH } = this.tipData;
        if (isETH) {
            this.tipData.value = toWei(value).toString();
        } else {
            this.tipData.value = toTokenMinimalUnit(value, this.tipData.decimals).toString();
        }
    }

    renderBody() {
        const { tipData } = this;
        const meta = {
            title: routes.mainNetWork.name,
            chainId: routes.mainNetWork.chainId,
            url: routes.mainNetWork.blockExploreUrl,
            icon: 'logo.png',
        };

        const message = `${strings('tipper.tip_for', { "amount": renderFromWei(tipData.value) || 0, "symbol": tipData.symbol, "account": tipData?.name || strings('market.anonymous') })}?`

        return (
            <View style={styles.root}>
            
                <TransactionHeader currentPageInformation={meta} />
                <View style={styles.heading}>
                    <Text style={styles.message}>{message}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    {this.renderProfile()}
                    {this.renderInput()}
                    {this.renderBalance()}
                </View>
                {this.renderActions()}
            </View >
        );
    }

    renderProfile() {
        const { data } = this.props;
        const { tipData } = this;
        const addressType = this.toggleFullAddress ? 'full' : 'short';

        return (
            <View style={styles.profile}>
                <View style={styles.avatarView}>
                    <RemoteImage style={styles.avatar} source={{ uri: `data:image/png;base64,${tipData?.avatar}` }} />
                </View>
                <TouchableOpacity activeOpacity={0.6} onPress={this.toggleAddress}>
                    <EthereumAddress key={addressType} style={styles.address} address={tipData?.receiverAddress} type={addressType} />
                </TouchableOpacity>
            </View>
        )
    }

    renderInput() {
        const { tipData } = this;
        const { symbol, value } = tipData;
        const renderValue = renderFromWei(tipData.value);

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
                    value={renderFromWei(value)}
                    ref={this.amountInput}
                    testID={'request-amount-input'}
                />
                <Text style={styles.eth}>
                    {symbol}
                </Text>
            </View>

        )
    }

    renderBalance() {
        const { accounts } = Engine.state.AccountTrackerController;
        const { selectedAddress } = Engine.state.PreferencesController;
        const { ticker } = Engine.state.NetworkController.provider;
        const balance = fromWei(accounts[selectedAddress].balance);
   
        return (
            <View style={styles.errorWrapper}>
                <Text style={styles.errorHeader}>{strings('transaction.insufficient')}</Text>
                <Text style={styles.errorMessage}>{strings('tipper.current_balance', { "balance": `${balance} ${getTicker(ticker)}` })}</Text>
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
