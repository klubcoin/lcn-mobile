import DocumentPicker from 'react-native-document-picker';

export async function pickSingle() {
	try {
		const res = await DocumentPicker.pick();
		return res;
	} catch (err) {
		if (DocumentPicker.isCancel(err)) {
			return null;
		} else {
			throw err;
		}
	}
}

export async function pickMultiple() {
	try {
		const results = await DocumentPicker.pickMultiple();
		return results;
	} catch (err) {
		if (DocumentPicker.isCancel(err)) {
			return [];
		} else {
			throw err;
		}
	}
}
