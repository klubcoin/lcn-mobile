export function toggleNetworkModal() {
	return {
		type: 'TOGGLE_NETWORK_MODAL'
	};
}

export function toggleAccountsModal() {
	return {
		type: 'TOGGLE_ACCOUNT_MODAL'
	};
}

export function toggleCollectibleContractModal() {
	return {
		type: 'TOGGLE_COLLECTIBLE_CONTRACT_MODAL'
	};
}

export function toggleReceiveModal(asset) {
	return {
		type: 'TOGGLE_RECEIVE_MODAL',
		asset
	};
}

export function toggleConfirmLogoutModal(visible) {
	return {
		type: 'TOGGLE_CONFIRM_LOGOUT_MODAL',
		visible
	};
}

export function toggleDappTransactionModal(show) {
	return {
		type: 'TOGGLE_DAPP_TRANSACTION_MODAL',
		show
	};
}

export function toggleApproveModal(show) {
	return {
		type: 'TOGGLE_APPROVE_MODAL',
		show
	};
}

export function showConfirmOtherIdentityPrompt(data) {
	return {
		type: 'SHOW_CONFIRM_OTHER_IDENTITY',
		data
	};
}

export function toggleFriendRequestQR(visible) {
	return {
		type: 'TOGGLE_FRIEND_REQUEST_QR_MODAL',
		visible
	};
}
