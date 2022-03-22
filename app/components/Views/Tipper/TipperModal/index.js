import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Alert,
    InteractionManager,
    DeviceEventEmitter,
} from 'react-native';
import { colors } from '../../../../styles/common';
import Modal from 'react-native-modal';
import TransactionHeader from '../../../UI/TransactionHeader';
import RemoteImage from '../../../Base/RemoteImage';
import EthereumAddress from '../../../UI/EthereumAddress';
import StyledButton from '../../../UI/StyledButton';
import styles from './styles/index'
import { strings } from '../../../../../locales/i18n';
import { action, makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import routes from '../../../../common/routes';
import Api from '../../../../services/api';
import { toWei, toTokenMinimalUnit, fromWei, BNToHex } from '../../../../util/number';
import Engine from '../../../../core/Engine';
import { getTicker } from '../../../../util/transactions';
import BigNumber from 'bignumber.js';
import * as sha3JS from 'js-sha3';
import { WalletDevice } from '@metamask/controllers';
import TransactionTypes from '../../../../core/TransactionTypes';
import NotificationManager from '../../../../core/NotificationManager';
import { ScrollView } from 'react-native-gesture-handler';

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
    amount = 0;
    errorMessage = '';

    constructor(props) {
        super(props);
        makeObservable(this, {
            toggleFullAddress: observable,
            tipData: observable,
            amount: observable,
            errorMessage: observable,
            initData: action,
            updateAmount: action
        })
    }

    componentDidMount() {
        this.initData();
    }

    initData = () => {
        const { data } = this.props;
        const { receiverAddress, value } = data;
        this.getWalletInfo(receiverAddress);
        this.tipData = data;
        this.amount = fromWei(value);
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

    prepareTransactionToSend = () => {
        const { selectedAddress } = Engine.state.PreferencesController;
        const { receiverAddress, value } = this.tipData;
        const hash = sha3JS.keccak_256(selectedAddress);

        return {
            data: hash,
            from: selectedAddress,
            gas: BNToHex(0),
            gasPrice: BNToHex(0),
            to: receiverAddress,
            value: BNToHex(BigNumber(value))
        };
    };

    goBack = () => {
        this.props.navigation.goBack();
    };


    onConfirm = async () => {
        if (this.processing) return;

        const { TransactionController } = Engine.context;
        const { value } = this.tipData;
        const { visible, hideModal } = this.props;

        try {
            const transaction = this.prepareTransactionToSend();

            const { result, transactionMeta } = await TransactionController.addTransaction(
                transaction,
                TransactionTypes.MMM,
                WalletDevice.MM_MOBILE
            );

            await TransactionController.approveTransaction(transactionMeta.id);
            await new Promise(resolve => resolve(result));

            if (transactionMeta.error) {
                throw transactionMeta.error;
            }

            InteractionManager.runAfterInteractions(() => {
                DeviceEventEmitter.emit(`SubmitTransaction`, transactionMeta);
                NotificationManager.watchSubmittedTransaction({
                    ...transactionMeta,
                });
            });
            this.processing = false;
            hideModal();
        } catch (error) {
            this.processing = false;
            Alert.alert(strings('transactions.transaction_error'), error && error.message, [
                { text: strings('navigation.ok') }
            ]);
        }

    };

    toggleAddress = () => {
        this.toggleFullAddress = !this.toggleFullAddress;
    }

    updateAmount = (value) => {
        if (!value) value = 0;
        this.amount = value;
        const { isETH } = this.tipData;
        if (isETH) {
            this.tipData.value = toWei(value).toString();
        } else {
            this.tipData.value = toTokenMinimalUnit(value, this.tipData.decimals).toString();
        }
    }

    validateAmount = () => {
        const { value } = this.tipData;
        const { accounts } = Engine.state.AccountTrackerController;
        const { selectedAddress } = Engine.state.PreferencesController;
        const balance = fromWei(accounts[selectedAddress].balance);

        try {
            if (!value || !balance) return;

            const isValid = BigNumber(balance).gte(BigNumber(fromWei(value)));

            if (!isValid) {
                this.errorMessage = strings('transaction.insufficient')
            }
            else if (isValid) {
                this.errorMessage = '';
            }
        } catch (error) {
            this.errorMessage = strings('sync_with_extension.something_wrong');
        }
    }

    renderBody() {
        const { tipData } = this;
        const meta = {
            title: routes.mainNetWork.name,
            chainId: routes.mainNetWork.chainId,
            url: routes.mainNetWork.blockExplorerUrl,
            icon: 'logo.png',
        };

        const message = `${strings('tipper.tip_for', { "amount": fromWei(tipData.value) || 0, "symbol": tipData.symbol, "account": tipData?.name || strings('market.anonymous') })}?`
        return (
            <View style={styles.root}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
                </ScrollView>
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

        return (
            <View style={styles.amountInput}>
                <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="numeric"
                    multiline={true}
                    onChangeText={(value) => this.updateAmount(value.replace(',', '.'))}
                    placeholder={strings('payment_request.amount_placeholder')}
                    placeholderTextColor={colors.grey100}
                    spellCheck={false}
                    style={styles.input}
                    value={this.amount}
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

        this.validateAmount();

        return (
            !!this.errorMessage && <View style={styles.errorWrapper}>
                <Text style={styles.errorHeader}>{this.errorMessage}</Text>
                <Text style={styles.errorMessage}>{strings('tipper.current_balance', { "balance": `${balance} ${getTicker(ticker)}` })}</Text>
            </View>
        )
    }

    renderActions() {
        const { confirmLabel, cancelLabel } = this.props;
        const { value } = this.tipData;

        return (
            <View style={styles.buttons}>
                <StyledButton
                    type={!!this.errorMessage || value == 0 ? 'cancel' : 'confirm'}
                    containerStyle={styles.accept}
                    onPress={(!this.errorMessage && value !== 0 && !this.processing) ? () => this.onConfirm() : null}
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
