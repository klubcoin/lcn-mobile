<template>
	<qrcode-vue :value="tipData" :size="size" level="H" />
</template>
<script>
import QrcodeVue from 'qrcode.vue';

export default {
	data() {
		return {
			size: 200
		};
	},
	props: {
		tipData: String
	},
	components: {
		QrcodeVue
	}
};
</script>
