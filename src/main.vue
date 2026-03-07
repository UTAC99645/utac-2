<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <n-flex justify="end">
        <n-breadcrumb separator="<->">
          <n-breadcrumb-item v-for="item in way" :key="item.path" @click="router.push(item.path)">
            <n-text :type="route.path === item.path ? 'info' : 'default'">
              {{ item.name }}
            </n-text>
          </n-breadcrumb-item>
        </n-breadcrumb>
      </n-flex>
      <n-divider />
      <n-flex justify="center">
        <router-view />
      </n-flex>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { darkTheme } from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute()
const router = useRouter()
const way = ref([
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' }
])
</script>

<style scoped></style>
