<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div>
    <a href="https://lssr.dntz.xyz" target="_blank">
      <img src="./assets/lssr.svg" class="logo" alt="Lssr logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="LSSR + Vue" />
</template>

<style scoped>
.logo {
  height: 7em;
  padding: .75em;
  will-change: filter;
  transition: filter 300ms;
}

.logo.vue {
  height: 6em;
  padding: 1.5em;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #ff3f3faa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
