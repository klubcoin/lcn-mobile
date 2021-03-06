import { REHYDRATE } from 'redux-persist';

const initialState = {
	loadingMsg: '',
	loadingSet: false,
	passwordSet: false,
	seedphraseBackedUp: false,
	backUpSeedphraseVisible: false,
	protectWalletModalVisible: false,
	onboardProfile: {},
};

const userReducer = (state = initialState, action) => {
	switch (action.type) {
		case REHYDRATE:
			if (action.payload && action.payload.user) {
				return { ...state, ...action.payload.user };
			}
			return state;
		case 'LOADING_SET':
			return {
				...state,
				loadingSet: true,
				loadingMsg: action.loadingMsg
			};
		case 'LOADING_UNSET':
			return {
				...state,
				loadingSet: false
			};
		case 'KEYCLOAK_AUTH_SET':
			return {
				...state,
				keycloakAuth: true
			};
		case 'KEYCLOAK_AUTH_UNSET':
			return {
				...state,
				keycloakAuth: false
			};
		case 'PASSWORD_SET':
			return {
				...state,
				passwordSet: true
			};
		case 'PASSWORD_UNSET':
			return {
				...state,
				passwordSet: false
			};
		case 'SEEDPHRASE_NOT_BACKED_UP':
			return {
				...state,
				seedphraseBackedUp: false,
				backUpSeedphraseVisible: true
			};
		case 'SEEDPHRASE_BACKED_UP':
			return {
				...state,
				seedphraseBackedUp: true,
				backUpSeedphraseVisible: false
			};
		case 'BACK_UP_SEEDPHRASE_VISIBLE':
			return {
				...state,
				backUpSeedphraseVisible: true
			};
		case 'BACK_UP_SEEDPHRASE_NOT_VISIBLE':
			return {
				...state,
				backUpSeedphraseVisible: false
			};
		case 'PROTECT_MODAL_VISIBLE':
			if (!state.seedphraseBackedUp) {
				return {
					...state,
					protectWalletModalVisible: true
				};
			}
			return state;
		case 'PROTECT_MODAL_NOT_VISIBLE':
			return {
				...state,
				protectWalletModalVisible: false
			};
		case 'ONBOARD_PROFILE':
			return {
				...state,
				onboardProfile: action.profile
			};
		default:
			return state;
	}
};
export default userReducer;
