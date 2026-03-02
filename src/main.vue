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
    <router-view />
  </n-config-provider>
</template>

<script setup>
import { darkTheme } from 'naive-ui'
</script>

<style scoped>
</style>
