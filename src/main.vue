<template>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <n-flex justify="end">
        <div v-for="item in way" :key="item.path">
          <n-button :type="item.path === route.path ? 'info' : 'warning'" size="large"
            @click="() => router.push(item.path)">
            {{ item.name }}
          </n-button>
        </div>
      </n-flex>
      <n-divider />
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { darkTheme } from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute()
const router = useRouter()
const way = ref([
  { name: Home, path: '/' },
  { name: About, path: '/about' }
])
</script>

<style scoped></style>
