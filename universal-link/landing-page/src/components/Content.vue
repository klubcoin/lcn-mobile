<template>
	<div v-if="tipLink" class="content-wrapper" align="center">
		<h1>Tip {{ tipValue }} {{ symbol }} for {{ recipient?.name || 'Anonymous' }}</h1>
		<p v-on:click="changeAddressType" class="address">{{ renderAddress() }}</p>
		<QRCode :tipData="tipLink" />
	</div>
</template>

<script>
import QRCode from './QRCode.vue';
import qs from 'qs';
import { fromWei } from 'web3-utils';
import routes from '../../routes';

const host = 'http://dev.telecelplay.io';
var tipLink = '';
var tipValue = 0;
var symbol = '';
var recipient = {};
var addressType = 'short';

export default {
	name: 'Content',
	data() {
		return {
			tipLink,
			tipValue,
			symbol,
			recipient,
			addressType,
		};
	},
	methods: {
		async fetchWalletInfo() {
			const url = routes.mainNetWork.url;
			const requestOpts = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...routes.basicMethod,
					method: routes.walletInfo,
					params: [this.recipient.address],
				}),
			};
			try {
				const response = await fetch(url, requestOpts);
				const data = await response.json();
				if (data?.result) {
					this.recipient.name = data.result.name;
				}
			} catch (error) {
				console.log('error', error);
			}
		},
		initData() {
			try {
				const path = window.location.pathname;
				if (path.indexOf('/tip/') == 0) {
					var recipientAddress = window.location.pathname.split('/')[2];
					var queryString = window.location.search.replace('?', '');
					var params = qs.parse(queryString);

					this.tipValue = fromWei(params.value, 'ether');
					this.symbol = params.symbol;
					this.recipient.address = recipientAddress;

					this.tipLink = `${host}/tip/${recipientAddress}?value=${params.value}&symbol=${params.symbol}&isETH=${params.isETH}&decimals=${params.decimals}`;
					this.fetchWalletInfo();
				}
			} catch (error) {
				console.log('error', error);
			}
		},
		renderAddress() {
			if (this.addressType == 'short')
				return `${recipient.address.substr(0, 4 + 2)}...${recipient.address.substr(-4)}`;
			else return recipient.address;
		},
		changeAddressType() {
			this.addressType == 'short' ? (this.addressType = 'full') : (this.addressType = 'short');
		},
	},
	created() {
		this.initData();
	},
	components: {
		QRCode,
	},
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
.address {
	width: fit-content;
}
</style>
