import routes from '../common/routes';
import { MAINNET } from '../constants/network';

/**
 * Gets the etherscan link for an address in a specific network
 *
 * @param {network} string - name of the network
 * @param {address} string - ethereum address to be used on the link
 * @returns - string
 */
export function getEtherscanAddressUrl(network, address) {
	return `${getEtherscanBaseUrl(network)}/address/${address}`;
}

/**
 * Gets the etherscan link for a transaction in a specific network
 *
 * @param {network} string - name of the network
 * @param {tx_hash} string - hash of the transaction to be used on the link
 * @returns - string
 */
export function getEtherscanTransactionUrl(network, tx_hash) {
	return `${getEtherscanBaseUrl(network)}/tx/${tx_hash}`;
}

/**
 * Gets the base etherscan link for a transaction in a specific network
 *
 * @param {network} string - name of the network
 * @returns - string
 */
export function getEtherscanBaseUrl(network) {
	if (network.toLowerCase() === MAINNET) return routes.mainNetWork.blockExplorerUrl;
	const subdomain = `${network.toLowerCase()}.`;
	return `https://${subdomain}etherscan.io`;
}
