<template>
    <h2>
        <main>关于</main>
    </h2>
    <p></p>
    <div v-for="item in source">
        <img :src="item.img" :alt="item.name"/><br>
        NAME:<span class="name">{{ item.name }}</span><br>
        mail:<span class="mail">{{ item.mail }}</span><br>
    </div>
</template>
<script setup>
import { ref } from 'vue';
const source = ref([{
    img:'/public/assets/128961378_p0.png',
    name: 'UTAC99645',
    mail: 'utac@utac996465.top',
},
{
    img:'/public/assets/20251116120114_232_4.jpg',
    name: 'DDXGYFF',
    mail: '114514@114514.114514',
},
]);
console.log(source.image);
</script>
<style scoped>
span {
    font-weight: bold;
    font-size: 40px;
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

img {
    width: 50%;
    height: auto;
    border-radius: 50%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s, box-shadow 0.3s;
}
image:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}
</style>