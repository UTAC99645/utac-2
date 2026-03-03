<template>
  <div v-if="!onLink">
    <title type="info">UTAC'S Sesrch</title>
    <nav class="search-type">
      <ul>
        <li><button :class="[bing ? 'active' : '']" @click="() => { search_type = 'bing' }">bing</button></li>
        <li><button :class="[google ? 'active' : '']" @click="() => { search_type = 'google' }">google</button></li>
        <li><button :class="[Link ? 'active' : '']" @click="() => { search_type = 'Link' }">Link</button></li>
      </ul>
    </nav>
    <div class="page">
      <h1 class="title">UTAC'S Sesrch</h1>
      <div class="search-box">
        <form @submit.prevent="searchfin">
          <n-input round status='info' loading clearable size="large" v-model:value="searchText" type="text" id="Search"
            placeholder="Search" />
        </form>
      </div>
    </div>
  </div>
  <div v-else>
    <n-button size="large" dashed @click="() => { typeMap.set('Link', { ...typeMap.get('Link'), on: false }) }">
      Back
    </n-button>
    <Rader :url="searchText" />
  </div>
</template>


<script setup>
import { useMessage } from 'naive-ui'
import Rader from './Link.vue'
import "./home.css"
const search_link = ref("")
const searchText = ref('')
const search_type = ref('google')
const message = useMessage()
const urlMatch = /^(http[s]?:\/\/)/
const typeMap = reactive(new Map([
  ['google', { en: true, url: 'https://www.google.com/search?q=' }],
  ['bing', { en: false, url: 'https://www.bing.com/search?q=' }],
  ['Link', { en: false, on: false, url: '' }]
]))
const keys = [...typeMap.keys()]
const rute = useRoute()
const roter = useRouter()
const bing = computed(() => {
  return typeMap.get('bing').en
})
const google = computed(() => {
  return typeMap.get('google').en
})
const Link = computed(() => {
  return typeMap.get('Link').en
})
const onLink = computed(() => {
  return typeMap.get('Link').on
})
onMounted(() => {
  if (rute.query.type) {
    checkUrl()
  } else {
    search_change(search_type.value)
  }
})
watch(search_type, () => { search_change(), makeUrl() }, { immediate: true, deep: true })

watch(searchText, () => { roter.replace({ query: { ...rute.query, q: searchText.value } }) })

function searchfin() {
  if (!searchText.value.trim()) {
    message.warning('Nothing to search');
    return;
  }
  if (Link.value) {
    typeMap.set('Link', { ...typeMap.get('Link'), on: true })
    message.success(`${searchText.value}`)
    return 0
  } else if (urlMatch.test(searchText.value)) {
    window.open(searchText.value);
  } else {
    let query = encodeURIComponent(searchText.value)
    window.open(`${search_link.value}${query}`, `_blank`);
  }
}

async function search_change() {
  keys.forEach(key => {
    if (key === search_type.value) {
      typeMap.set(key, { ...typeMap.get(search_type.value), en: true })
    } else {
      typeMap.set(key, { ...typeMap.get(key), en: false })
    }
    search_link.value = typeMap.get(search_type.value).url
  })
}

async function makeUrl() {
  await roter.replace({ query: { ...rute.query, type: search_type.value } })
}

function checkUrl() {
  if (rute.query.q) searchText.value = rute.query.q
  let { type, open } = rute.query
  if (open) {
    search_type.value = type
    nextTick(() => {
      searchfin()
    })
    return
  }

  search_type.value = type
}
</script>
