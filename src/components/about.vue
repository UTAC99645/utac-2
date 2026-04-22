<template>
  <!-- 关于页面组件 -->
  <!-- 页面标题 -->
  <n-gradient-text
    type="warning"
    :size="30"
  >
    关于
  </n-gradient-text>
  <!-- 人员信息列表 -->
  <div v-if="source.length">
    <div v-for="item in source" :key="item.mail">
      <!-- 头像图片 -->
      <img :src="item.img" :alt="item.name" /><br>
      <!-- 名称展示 -->
      <n-gradient-text
        type="success">
        NAME: 
        <span class="name">
          {{ item.name }}
        </span>
      </n-gradient-text><br>
      <!-- 邮箱展示 -->
      <n-gradient-text
        type="success">
        MAIL: 
        <span class="mail">
          {{ item.mail }}
        </span>
      </n-gradient-text><br>
    </div>
  </div>
  <!-- 加载中提示 -->
  <div v-else>加载中...</div>
</template>

<script setup>
// 引入 Vue 组合式 API
import { ref, onMounted } from 'vue'

// 人员信息数据
const source = ref([])

// 组件挂载时获取数据
onMounted(async () => {
  const res = await fetch('/assets/json/about.json')
  source.value = await res.json()
  console.log(source.value)
})
</script>

<!-- 引入外部样式文件 -->
<style scoped>

</style>
