import { sha256 } from '../core/CryptoSignature';
import uuid from 'react-native-uuid';

export const ConfirmProfileRequest = (from, firstname, lastname, avatar, email) => ({
	action: 'confirm_profile_request',
	from,
	firstname,
	lastname,
	avatar,
	email
});

export const ConfirmProfileRejected = (from, firstname, lastname) => ({
	action: 'confirm_profile_rejected',
	from,
	firstname,
	lastname
});

export const ConfirmProfileBlock = from => ({
	action: 'confirm_profile_block',
	from
});

export const RestoreSecretRequest = (from, firstname, lastname, avatar) => ({
	action: 'restore_secret_request',
	from,
	firstname,
	lastname,
	avatar
});

export const AckWebRTC = checksum => ({
	action: 'ack',
	hash: checksum
});

export const Chat = (message, from, to) => ({
	action: 'chat',
	message,
	from,
	to,
	checksum: sha256(message + uuid.v4()),
	createdAt: new Date().getTime()
});

export const Typing = () => ({
	action: 'typing'
});

export const ChatProfile = profile => ({
	action: 'chat_profile',
	profile
});

export const RequestPayment = (to, request) => ({
	action: 'payment_request',
	to: `${to}`.toLowerCase(),
	...request
});

export const TransactionSync = (transaction) => ({
	action: 'transaction_sync',
	...transaction
});

export const ChatFile = (to, fileInfo) => ({
	action: 'chat_file',
	to: `${to}`.toLowerCase(),
	...fileInfo,
})