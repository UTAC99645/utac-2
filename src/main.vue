<template>
  <div id="header">
    <header>
      <ul>
        <li><router-link to="/" class="active">Home</router-link></li>
        <li><router-link to="/about">About</router-link></li>
      </ul>
    </header>
  </div>
  <div>
    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
/* 添加一些基础样式 */
header {
  background-color: #333;
  color: #fff;
  padding: 10px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: inline;
  margin-right: 10px;
}

a {
  color: #fff;
  text-decoration: none;
}

a.router-link-active {
  font-weight: bold;
}
</style>