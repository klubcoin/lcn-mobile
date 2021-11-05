export function assignNestedObj(target, source) {
	const result = {};
	Object.keys(target).map(k => {
		result[k] = Object.assign({}, target[k], source[k] || {});
	});
	return result;
}
