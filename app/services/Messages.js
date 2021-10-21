import { sha256 } from 'hash.js';

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
	checksum: sha256(message).digest('hex'),
	createdAt: new Date().getTime()
});

export const Typing = () => ({
	action: 'typing'
});
