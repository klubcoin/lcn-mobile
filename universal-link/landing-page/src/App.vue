<template>
	<div>
		<ImageLink
			class="site-logo"
			href="https://www.liquichain.io/"
			source="https://www.liquichain.io/assets/images/logo-white.svg"
		/>

		<h1 class="app-slogan">A sustainable blockchain for the people.</h1>
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
	}
};
</script>

<style>
body {
	display: flex;
	flex: 1;
	background: #310a6b;
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
</style>
