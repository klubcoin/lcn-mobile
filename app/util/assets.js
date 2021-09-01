const pack = require('../../package.json'); // eslint-disable-line

/**
 * Utility function to return corresponding @metamask/contract-metadata logo
 *
 * @param {string} logo - Logo path from @metamask/contract-metadata
 */
export default function getAssetLogoPath(logo) {
	const version = pack.dependencies['@metamask/contract-metadata']?.replace('^', '');
	if (!logo) return;
	return `https://docs.liquichain.io/media/app/${logo}?v=${version}`;
}
