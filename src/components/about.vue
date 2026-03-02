<template>
  <n-gradient-text
    type="warning"
    :size="30"
  >
    关于
  </n-gradient-text>
  <div v-if="source.length">
    <div v-for="item in source" :key="item.mail">
      <img :src="item.img" :alt="item.name" /><br>
      <n-gradient-text
        type="success">
        NAME: 
        <span class="name">
          {{ item.name }}
        </span>
      </n-gradient-text><br>
      <n-gradient-text
        type="success">
        MAIL: 
        <span class="mail">
          {{ item.mail }}
        </span>
      </n-gradient-text><br>
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

</style>
