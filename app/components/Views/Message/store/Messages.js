import { sha256 } from '../../../../core/CryptoSignature';
import uuid from 'react-native-uuid';

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
	loading: true,
	...fileInfo,
})