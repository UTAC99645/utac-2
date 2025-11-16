<template>
    <h2>
        <main>关于</main>
    </h2>
    <p></p>
    <div v-for="item in source">
        <image :src="item.img" alt="UTAC99645"/><br>
        NAME:<span class="name">{{ item.name }}</span><br>
        mail:<span class="driver">{{ item.mail }}</span><br>
    </div>
</template>
<script setup>
import { ref } from 'vue';
const source = ref([{
    img:'assets/128961378_p0.png',
    name: 'UTAC99645',
    mail: 'utac@utac996465.top',
},
]);
</script>
<style scoped>
.name {
    text-align: center;
    font-size: 30px;
    color: #42b983;
}

.driver {
    text-align: center;
    font-size: 30px;
    color: #42b983;
}

.mail {
    text-align: center;
    font-size: 30px;
    color: #42b983;
}

.UTAC99645 {
    text-align: center;
    font-size: 25px;
    color: #42b983;
}

body {
    margin: 0;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(45deg, #90e0f0, #feb47b, #ff7e5f);
    background-size: 600% 600%;
    animation: gradient 15s infinite linear;
}

@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}

image {
    width: 300px;
    height: auto;
    border-radius: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s, box-shadow 0.3s;
}
</style>