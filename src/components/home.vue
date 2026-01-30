<template>
  <title>UTAC'S Sesrch</title>
  <div class="page">
    <h1 class="title">UTAC'S Sesrch</h1>
    <div class="search-box">
      <d-search v-model="searchText" @search="searchfin" placeholder="Type to search throgh bing..." />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchText = ref('')

function searchfin() {
  const query = encodeURIComponent(searchText.value);
  window.open(`https://www.bing.com/search?q=${query}`, '_blank');
}
</script>

<style scoped>
.page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 80px;
  box-sizing: border-box;
}

.title {
  font-size: 48px;
  color: #42b983;
  text-align: center;
  margin-bottom: 40px;
  font-weight: 600;
  letter-spacing: 1px;
}

.search-box {
  display: inline-block;
  padding: 4px;
  background: transparent;
  width: 75vw;
  max-width: 90vw;
  display: flex;
  justify-content: center;
}

.seach-box d-search {
  width: 100%;
}
</style>