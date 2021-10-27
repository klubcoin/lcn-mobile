const initialState = {
	networkModalVisible: false,
	accountsModalVisible: false,
	collectibleContractModalVisible: false,
	receiveModalVisible: false,
	confirmLogoutModalVisible: false,
	receiveAsset: undefined,
	dappTransactionModalVisible: false,
	approveModalVisible: false,
	otherIdentityToConfirm: null,
	friendRequestQRVisible: false,
};

const modalsReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'TOGGLE_NETWORK_MODAL':
			return {
				...state,
				networkModalVisible: !state.networkModalVisible
			};
		case 'TOGGLE_RECEIVE_MODAL': {
			return {
				...state,
				receiveModalVisible: !state.receiveModalVisible,
				receiveAsset: action.asset
			};
		}
		case 'TOGGLE_CONFIRM_LOGOUT_MODAL': {
			return {
				...state,
				confirmLogoutModalVisible: !state.confirmLogoutModalVisible
			};
		}
		case 'TOGGLE_ACCOUNT_MODAL':
			return {
				...state,
				accountsModalVisible: !state.accountsModalVisible
			};
		case 'TOGGLE_COLLECTIBLE_CONTRACT_MODAL':
			return {
				...state,
				collectibleContractModalVisible: !state.collectibleContractModalVisible
			};
		case 'TOGGLE_DAPP_TRANSACTION_MODAL':
			return {
				...state,
				dappTransactionModalVisible: action.show === null ? !state.dappTransactionModalVisible : action.show
			};
		case 'TOGGLE_APPROVE_MODAL':
			return {
				...state,
				approveModalVisible: !state.approveModalVisible
			};
		case 'SHOW_CONFIRM_OTHER_IDENTITY':
			return {
				...state,
				otherIdentityToConfirm: action.data
			};
		case 'TOGGLE_FRIEND_REQUEST_QR_MODAL':
			return {
				...state,
				friendRequestQRVisible: action.visible
			};
		default:
			return state;
	}
};
export default modalsReducer;
