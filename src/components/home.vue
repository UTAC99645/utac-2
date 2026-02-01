<template>
  <title>UTAC'S Sesrch</title>
  <nav class="search-type">
    <ul>
      <li><button :class="[bing ? 'active' : '']" @click="() => { search_type = 'bing' }">bing</button></li>
      <li><button :class="[google ? 'active' : '']" @click="() => { search_type = 'google' }">google</button></li>
      <li><button :class="[MarkDown ? 'active' : '']" @click="() => { search_type = 'MarkDown' }">MarkDown</button></li>
    </ul>
  </nav>
  <div class="page">
    {{ search_type }}
    {{ onMarkDown }}
    <h1 class="title">UTAC'S Sesrch</h1>
    <div v-if="!onMarkDown" class="search-box">
      <form class="form" @submit.prevent="searchfin">
        <input
	v-model="searchText"
	type="text"
	id="Search"
	class="form__input"
	placeholder="" />
        <label for="Search" class="form__label">
          {{ search_type }}
        </label>
      </form>
    </div>
    <div v-else>
      <button @click="() => { onMarkDown = false}">Back</button>
      <Rader :url="searchText"/>
    </div>
  </div>
</template>


<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Rader from './MarkDown.vue'
import "./home.css"
import './addon/input.css'
const search_link = ref("")
const searchText = ref('')
const search_type = ref('google')
const google = ref(true)
const bing = ref(false)
const MarkDown = ref(false)
const onMarkDown = ref(false)
const rute = useRoute()
const roter = useRouter()

onMounted(() => {
  if (rute.query) {
    checkUrl()
  } else {
    search_change(search_type.value)
  }
})
watch(search_type, [search_change, makeUrl], { immediate: true, deep: true })

function searchfin() {
  if (MarkDown.value) {
  onMarkDown.value = true
  return 0
  }else {
    const query = encodeURIComponent(searchText.value);
    window.open(`${search_link.value}${query}`, '_blank');
  }
}

function search_change() {
  if (search_type.value === 'google') {
    google.value = true
    bing.value = false
    MarkDown.value = false
    search_link.value = "https://www.google.com/search?q="
  } else if (search_type.value === 'bing') {
    google.value = false
    bing.value = true
    MarkDown.value = false
    search_link.value = "https://www.bing.com/search?q="
  } else if (search_type.value === 'MarkDown') {
    google.value = false
    bing.value = false
    MarkDown.value = true
  }
}

function makeUrl() {
  if (search_type.value === 'google') {
    roter.replace({ query: { type: 'google' } })
  } else if (search_type.value === 'bing') {
    roter.replace({ query: { type: 'bing' } })
  } else if (search_type.value === 'MarkDown') {
  roter.replace({ query: { type: 'MarkDown' } })
  }
}

function checkUrl() {
  search_type.value = rute.query.type
}
</script>

<style scoped></style>
