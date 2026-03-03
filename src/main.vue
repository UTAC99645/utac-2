<template>
  <div class="navDiv">
    <nav>
      <ul>
        <li><router-link to="/about">About</router-link></li>
        <li><router-link to="/">Home</router-link></li>
      </ul>
    </nav>
  </div>
  <n-config-provider :theme="darkTheme">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { darkTheme } from 'naive-ui'
</script>

<style scoped></style>
