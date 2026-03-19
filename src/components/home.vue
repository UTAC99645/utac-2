<template>
  <div v-if="!onLink">
    <title type="info">UTAC'S Sesrch</title>

    <n-flex justify="space-around">
      <div v-for="[key, item] in typeMap">
        <n-button :type="search_type === key ? 'info' : 'warning'" size="large"
          @click="() => { search_type = key, message.warning(`Search with ${key}`) }">
          {{ key }}
        </n-button>
      </div>
    </n-flex>
    <n-divider />
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
    <n-flex justify="space-around">
      <n-button type="warning" size="large" dashed
        @click="() => { typeMap.set('Link', { ...typeMap.get('Link'), on: false }) }">
        Back
      </n-button>
    </n-flex>
    <Rader :url="searchText" />
  </div>
</template>

<script setup>
import { useMessage } from 'naive-ui'
import Rader from './Link.vue'
import "./home.css"
import { nextTick } from 'vue'
const search_link = ref("")
const searchText = ref('')
const search_type = ref('duckduckgo')
const message = useMessage()
const urlMatch = /^(http[s]?:\/\/)/
const typeMap = reactive(new Map([
  ['google', { en: true, url: 'https://www.google.com/search?q=' }],
  ['bing', { en: false, url: 'https://www.bing.com/search?q=' }],
  ['duckduckgo', { en: false, url: 'https://duckduckgo.com/?q=' }],
  ['Link', { en: false, on: false, url: '' }]
]))
const keys = [...typeMap.keys()]
const route = useRoute()
const router = useRouter()
const loadingBar = useLoadingBar()
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const Link = computed(() => {
  return typeMap.get('Link').en
})
const onLink = computed(() => {
  return typeMap.get('Link').on
})
onMounted(async () => {
  loadingBar.start()
  nextTick(() => {
    if (route.query.type) {
      checkUrl()
    } else {
      search_change(search_type.value)
    }
  })
  loadingBar.finish()
})
watch(search_type, () => { search_change(), makeUrl() }, { immediate: true, deep: true })

watch(searchText, () => { router.replace({ query: { ...route.query, q: searchText.value } }) })

function searchfin() {
  if (!searchText.value.trim()) {
    message.warning('Nothing to search');
    return;
  }
  if (Link.value) {
    typeMap.set('Link', { ...typeMap.get('Link'), on: true })
    message.success(`Link to '${searchText.value}'`)
    return 0
  } else if (urlMatch.test(searchText.value)) {
    window.open(searchText.value);
  } else {
    let query = encodeURIComponent(searchText.value)
    window.open(`${search_link.value}${query}`, `_blank`);
  }
}

async function search_change() {
  loadingBar.start()
  keys.forEach(key => {
    if (key === search_type.value) {
      typeMap.set(key, { ...typeMap.get(search_type.value), en: true })
    } else {
      typeMap.set(key, { ...typeMap.get(key), en: false })
    }
    search_link.value = typeMap.get(search_type.value).url
  })
  await sleep(500)
  loadingBar.finish()
}

async function makeUrl() {
  await router.replace({ query: { ...route.query, type: search_type.value } })
}

function checkUrl() {
  if (route.query.q) searchText.value = route.query.q
  let { type, open } = route.query
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
