<template>
  <!-- ========================================================== -->
  <!-- 关于页面
       数据来源：/assets/json/about.json
       字段说明：
         - img  : 头像地址
         - name : 名称
         - mail : 邮箱（作为列表 key）
  -->
  <!-- ========================================================== -->

  <!-- 页面标题 -->
  <n-gradient-text type="warning" :size="30">
    关于
  </n-gradient-text>

  <!-- 人员信息列表 -->
  <div v-if="source.length">
    <div v-for="item in source" :key="item.mail">

      <!-- 头像 -->
      <img :src="item.img" :alt="item.name" /><br>

      <!-- 名称 -->
      <n-gradient-text type="success">
        NAME:
        <span class="name">{{ item.name }}</span>
      </n-gradient-text><br>

      <!-- 邮箱 -->
      <n-gradient-text type="success">
        MAIL:
        <span class="mail">{{ item.mail }}</span>
      </n-gradient-text><br>

    </div>
  </div>

  <!-- 加载中 -->
  <div v-else>加载中...</div>
</template>

<script setup>
// ============================================================
// 关于页面脚本
// ============================================================

// ---------- Vue 组合式 API ----------
import { ref, onMounted } from 'vue';

// ============================================================
// 数据
// ============================================================

const source = ref([]);

// ============================================================
// 生命周期
// ============================================================

onMounted(async () => {
  const res = await fetch('/assets/json/about.json');
  source.value = await res.json();
  console.log(source.value);
});
</script>

<style scoped>
/* 关于页面局部样式（当前为空，如需自定义可在下方添加） */
</style>
