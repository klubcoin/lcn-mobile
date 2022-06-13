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

export const DeleteMessage = (_id, group, user) => ({
	action: 'delete',
	_id,
	group,
	deleted: true,
	user,
	createdAt: new Date().getTime()
});

export const EditMessage = (_id, group, text, user) => ({
	action: 'edit',
	_id,
	group,
	text,
	user,
	edited: true,
	createdAt: new Date().getTime()
});

export const Typing = (name, group) => ({
	action: 'typing',
	name,
	group
});

export const JoinUpdate = address => ({
	action: 'join_peer',
	from: address
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

export const TransactionSync = transaction => ({
	action: 'transaction_sync',
	...transaction
});

export const ChatFile = (to, fileInfo) => ({
	action: 'chat_file',
	to: `${to}`,
	loading: true,
	...fileInfo
});
