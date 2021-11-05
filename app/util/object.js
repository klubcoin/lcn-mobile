export function assignNestedObj(target, source) {
	const result = Object.assign({}, target);
	Object.keys(result).map(k => {
		Object.assign(result[k], source[k] || {});
	});
	return result;
}
