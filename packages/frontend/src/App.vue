<template>
  <div id="app">
    <h1>LMS - レッスンスロット予約</h1>
    <SlotsView />
  </div>
</template>

<script setup lang="ts">
import SlotsView from './views/SlotsView.vue'
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  color: #333;
  margin-bottom: 2rem;
}
</style>