<template>
  <!-- ========================================================== -->
  <!-- 关于页面
       数据来源：https://file.utac.top/Web/utac/json/about.json
       字段说明：
         - img  : 头像地址
         - name : 名称
         - mail : 邮箱（作为列表 key）
  -->
  <!-- ========================================================== -->

  <!-- 单一根容器：避免多个顶层节点被 app.vue 的 <n-flex> 当作多个 flex 项横排 -->
  <div class="about-page">
    <!-- 页面标题 -->
    <n-gradient-text class="about-title" type="warning" :size="30">
      关于
    </n-gradient-text>

    <!-- 人员信息列表 -->
    <div v-if="source.length">
      <div v-for="item in source" :key="item.mail">

        <!-- 头像 -->
        <n-image :src="item.img" :alt="item.name" /><br>

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
  </div>
</template>

<script setup lang="ts">
// ============================================================
// 关于页面脚本
// ============================================================

// ---------- Vue 组合式 API ----------
import { ref, onMounted } from 'vue';
import axios from 'axios';

// ---------- 页面样式 ----------
import '../assets/css/about.css';

// ============================================================
// 数据
// ============================================================

// useMessage 由 Nuxt 自动导入（见 nuxt.config.ts 的 imports.presets），无需手动 import
const message = useMessage()
// 人员列表（about.json 拉取结果；字段说明见模板顶部注释）
const source = ref<{ img: string, name: string, mail: string }[]>([]);

// 独立 Axios 实例：指向托管 about.json 的静态文件服务
const Utac_res = axios.create({
  baseURL: "https://file.utac.top/Web/utac",
})
// ============================================================
// 生命周期
// ============================================================

// 挂载后拉取人员信息；失败时弹出错误提示
// @returns 无（副作用：填充 source 列表 / 失败时弹提示）
onMounted(async () => {
  await Utac_res.get("/json/about.json")
    .then(res => {
      console.log(res)
      source.value = res.data
    })
    .catch(err => {
      console.log(err)
      message.error(`err happend with ${err}`);
    })
});
</script>
