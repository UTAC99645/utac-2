<template>
  <h1>关于</h1>
  <div v-if="source.length">
    <div v-for="item in source" :key="item.mail">
      <img :src="item.img" :alt="item.name" /><br>
      <h2>NAME: <span class="name">{{ item.name }}</span></h2><br>
      <h2>MAIL: <span class="mail">{{ item.mail }}</span></h2><br>
    </div>
  </div>
  <div v-else>加载中...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import "./about.css"

const source = ref([])

onMounted(async () => {
  const res = await fetch('/assets/json/about.json')
  source.value = await res.json()
  console.log(source.value)
})
</script>

<style scoped>

</style>