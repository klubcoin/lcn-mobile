<template>
	<div>
		<ImageLink
			class="site-logo"
			href="https://klubcoin.net/"
			source="https://klubcoin.net/wp-content/uploads/2021/12/klubcoin_horinzontal_logo_home.png"
		/>

		<Content />

		<div class="app-links">
			<ImageLink
				href="https://play.google.com/store/apps/details?id=com.liquichain"
				:source="require('@/assets/google_play.png')"
			/>
			<ImageLink
				href="https://apps.apple.com/us/app/treadmeal/id1581708293"
				:source="require('@/assets/apple_store.png')"
			/>
		</div>

		<div class="deeplink">
			<h3>If you already installed the app, click <a :href="deeplink">here</a></h3>
		</div>
	</div>
</template>

<script>
import ImageLink from './components/ImageLink.vue';
import Content from './components/Content.vue';

export default {
	name: 'App',
	components: {
		ImageLink,
		Content
	},
	computed: {
		deeplink: () => window.location.href.replace(/http(s)?:\/\/[^/]+\//, 'klubcoin://'),
	},
};
</script>

<style>
body {
	display: flex;
	flex: 1;
	background: #000;
	color: #fff;
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

#app {
	display: flex;
	flex: 1;
	flex-direction: column;
	text-align: center;
}

.site-logo img {
	width: 250px;
}

.app-slogan {
	margin: 0;
}

.app-links {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 50px;
}
.image-link:last-child {
	margin-left: 20px;
}

.bg-logo {
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	width: 100%;
	height: 100%;
	flex: 1;
	z-index: -1000;
}
.deeplink {
	margin-top: 50px;
}
</style>
