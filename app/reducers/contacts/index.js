const initialState = {
	onlineWallets: [],
};

const contactReducer = (state = initialState, action) => {
	switch (action.type) {
		case 'ONLINE_FRIEND_WALLETS':
			return {
				...state,
				onlineWallets: action.onlineWallets
			};
		default:
			return state;
	}
};
export default contactReducer;
