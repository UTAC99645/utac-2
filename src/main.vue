<template>
  <nav>
    <ul>
      <li><router-link to="/about">About</router-link></li>
      <li><router-link to="/">Home</router-link></li>
    </ul>
  </nav>
  <router-view />
</template>

<script setup>
</script>

<style scoped>
/* 添加一些基础样式 */
a {
  text-decoration: none;
}

a.router-link-active {
  font-weight: bold;
}
</style>