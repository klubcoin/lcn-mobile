import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../styles/common';

const imgIcon = {
	icon: 'file-image-o',
	color: colors.mediaIcColor
};
const soundIcon = {
	icon: 'file-sound-o',
	color: colors.mediaIcColor
};
const videoIcon = {
	icon: 'file-video-o',
	color: colors.mediaIcColor
};
const pdfIcon = {
	icon: 'file-pdf-o',
	color: colors.pdfColor
};
const wordIcon = {
	icon: 'file-word-o',
	color: colors.wordColor
};
const excelIcon = {
	icon: 'file-excel-o',
	color: colors.excelColor
};
const pptIcon = {
	icon: 'file-powerpoint-o',
	color: colors.pptColor
};
const textIcon = {
	icon: 'file-text-o',
	color: colors.black
};
const archiveIcon = {
	icon: 'file-archive-o',
	color: colors.primaryFox100
};
const defaultIcon = {
	icon: 'file-o',
	color: colors.black
};

const fileIcons = {
	// Media
	'image/png': imgIcon,
	'image/jpeg': imgIcon,
	'image/gif': imgIcon,
	'audio/mpeg': soundIcon,
	'video/mp4': videoIcon,
	'video/mpeg': videoIcon,
	// Documents
	'application/pdf': pdfIcon,
	'application/msword': wordIcon,
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': wordIcon,
	'application/vnd.ms-excel': excelIcon,
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': excelIcon,
	'application/vnd.ms-powerpoint': pptIcon,
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': pptIcon,
	'application/vnd.oasis.opendocument.text': textIcon,
	// Archives
	'application/x-7z-compressed': archiveIcon,
	'application/zip': archiveIcon,
	'application/gzip': archiveIcon,
	//Default
	default: defaultIcon
};

function isValidString(o) {
	if (o === null) return false;
	if (!fileIcons.hasOwnProperty(o)) return false;
	if (typeof o == 'string' || (typeof o == 'object' && o.constructor === String)) {
		return o.length > 0;
	} else {
		return false;
	}
}

export function getFontAwesomeIconFromMIME(type) {
	var iconObj = isValidString(type) ? fileIcons[type] : fileIcons.default;
	return <Icon name={iconObj.icon} size={24} color={iconObj.color} />;
}
