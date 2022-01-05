<template>
	<div class="content-wrapper">
		<h1>Tip {{tipValue}} {{symbol}} for Neirt Vo</h1>
		<QRCode :tipData="qrValue" />
	</div>
</template>

<script>
import QRCode from './QRCode.vue';
import qs from 'qs';
import { fromWei } from 'web3-utils';

const host = 'http://meetthrufriends.com';
var tipLink = '';
var tipValue = 0;
var symbol = '';

function initQRValue() {
	try {
		var recipientAddress = window.location.pathname.split('/')[2];
		var queryString = window.location.search.replace('?', '');
		var params = qs.parse(queryString);

		tipValue = fromWei(params.value, 'ether');
		symbol = params.symbol;
		tipLink = `${host}/tip/${recipientAddress}?value=${params.value}&symbol=${params.symbol}&isETH=${params.isETH}&decimals=${params.decimals}`;
	} catch (error) {
		console.log('error', error);
	}
}

export default {
	name: 'Content',
	data() {
		return {
			qrValue: tipLink,
			tipValue: tipValue,
			symbol: symbol,
		};
	},
	beforeCreate: initQRValue(),
	components: {
		QRCode
	}
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.content-wrapper {
	margin-top: 40px;
	margin-bottom: 40px;
	flex-direction: column;
	flex: 1;
}
</style>
