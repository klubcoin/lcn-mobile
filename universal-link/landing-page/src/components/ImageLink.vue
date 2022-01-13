<template>
  <div class="image-link">
    <a :href="href">
      <img :src="source" />
    </a>
  </div>
</template>

<script>
export default {
  name: 'ImageLink',
  props: {
    href: String,
    source: String,
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
img {
  width: 180px;
  height: auto;
}
</style>
