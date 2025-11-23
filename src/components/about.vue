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

const source = ref([])

onMounted(async () => {
  const res = await fetch('/assets/json/about.json')
  source.value = await res.json()
  console.log(source.value)
})
</script>

<style scoped>
h2 {
  font-weight: bold;
  font-size: 40px;
}
span {
  color: #42b983;
}

body {
  margin: 0;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(45deg, #90e0f0, #feb47b, #ff7e5f);
  background-size: 600% 600%;
  animation: gradient 15s infinite linear;
}

@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

img {
  width: 50%;
  height: auto;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
}
img:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}
</style>