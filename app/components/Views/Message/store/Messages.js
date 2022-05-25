import { sha256 } from '../../../../core/CryptoSignature';
import uuid from 'react-native-uuid';

export const Chat = (message, from, to, group) => ({
	action: 'chat',
	message,
	from,
	to,
	group,
	checksum: sha256(message + uuid.v4()),
	createdAt: new Date().getTime()
});

export const Typing = (name, group) => ({
	action: 'typing',
	name,
	group,
});

export const JoinUpdate = (address) => ({
	action: 'join_peer',
	from: address,
});

export const ChatProfile = profile => ({
	action: 'chat_profile',
	profile
});

export const RequestPayment = (to, request) => ({
	action: 'payment_request',
	to: `${to}`,
	...request
});

export const TransactionSync = (transaction) => ({
	action: 'transaction_sync',
	...transaction
});

export const ChatFile = (to, fileInfo) => ({
	action: 'chat_file',
	to: `${to}`,
	loading: true,
	...fileInfo,
})