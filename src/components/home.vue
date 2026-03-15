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
      {{ searchHistory }}
    </div>
    <n-divider />
    <n-flex justify="center">
      <div v-for="(item, index) in searchHistory">
        <n-card>
          <n-text strong>
            {{ index + 1 }}
          </n-text>
          <n-divider />
          <n-text type="info">{{ item.time }}</n-text>
          <n-divider />
          <n-text type="success" @click="() => {
            if (urlMatch.test(item.url)) {
              window.open(item.url);
            } else {
              searchText.value = item.url
              search_type.value = 'Link'
              typeMap.set('Link', { ...typeMap.get('Link'), on: true })
            }
          }">{{ item.url }}</n-text>
          <n-divider />
          <n-flex justify="space-around">
            <n-button type="primary" size="small" @click="() => {
              if (!urlMatch.test(item.url)) {
                privateb.value = true
                searchText.value = item.text
                searchfin()
              } else {
                window.open(item.url);
              }
            }">
              Open
            </n-button>
            <n-button type="error" size="small" @click="() => {
              let arr = [...searchHistory]
              arr.splice(index, 1)
              Cookies.set('history', JSON.stringify(arr))
            }">
              Delete
            </n-button>
          </n-flex>
        </n-card>
      </div>
    </n-flex>
  </div>
  <div v-if="onLink">
    <n-button type="warning" size="large" dashed
      @click="() => { typeMap.set('Link', { ...typeMap.get('Link'), on: false }), message.warning('Back to search') }">
      Back
    </n-button>
    <n-flex justify="space-around">
      <Rader :url="searchText" />
    </n-flex>
  </div>
</template>

<script setup>
import { useMessage } from 'naive-ui'
import Rader from './Link.vue'
//import "./home.css"
const search_link = ref("")
const searchText = ref('')
const search_type = ref('duckduckgo')
const message = useMessage()
const dialog = useDialog()
const privateb = ref(false)
const urlMatch = /^(http[s]?:\/\/)/
const typeMap = reactive(new Map([
  ['google', { en: true, url: 'https://www.google.com/search?q=' }],
  ['bing', { en: false, url: 'https://www.bing.com/search?q=' }],
  ['duckduckgo', { en: false, url: 'https://duckduckgo.com/?q=' }],
  ['Link', { en: false, on: false, url: '' }]
]))
const searchHistory = computed(() => {
  const originsearchHistory = Cookies.get('history')
  if (originsearchHistory === undefined) return []
  try {
    return JSON.parse(originsearchHistory)
  } catch (err) {
    console.error('Failed to parse search history:', err)
    return []
  }
})
const keys = [...typeMap.keys()]
const route = useRoute()
const router = useRouter()
const Link = computed(() => {
  return typeMap.get('Link').en
})
const onLink = computed(() => {
  return typeMap.get('Link').on
})
const formatTime = (date = new Date()) => {
  const pad = num => num.toString().padStart(2, '0')
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const h = pad(date.getHours())
  const mi = pad(date.getMinutes())
  const s = pad(date.getSeconds())
  return `${y}-${m}-${d} ${h}:${mi}:${s}`
}
onMounted(() => {
  init()
})
watch(search_type, () => { search_change(), makeUrl() }, { immediate: true, deep: true })

watch(searchText, () => { router.replace({ query: { ...route.query, q: searchText.value } }) })

function init() {
  if (route.query.type) {
    checkUrl()
  } else {
    search_change(search_type.value)
  }
  if (Cookies.get('accepted') === undefined) {
    dialog.info({
      title: 'Welcome to UTAC\'S Sesrch',
      content: 'This website uses cookies to save your search searchHistory and preferences. By using this website, you agree to our use of cookies.',
      positiveText: 'I Agree',
      negativeText: 'I Disagree',
      onPositiveClick: () => {
        Cookies.set('accepted', true)
        message.success('Thank you for accepting our cookies!')
      },
      onNegativeClick: () => {
        Cookies.set('accepted', false)
        message.warning('You have declined our cookies. Your preferences will not be saved, but we still will use it to save your chooise')
      }
    })
  } else if (Cookies.get('accepted') === 'false') {
    message.warning('You have declined our cookies. Your preferences will not be saved, but we still will use it to save your chooise')
  }
  if (Cookies.get('history') === undefined) {
    Cookies.set('history', JSON.stringify([]))
  }
}

function searchfin() {
  if (Cookies.get('accepted') === 'true' && !privateb.value) {
    Cookies.set('history', JSON.stringify([...searchHistory.value, { url: Link.value ? searchText.value : `${search_link.value}${encodeURIComponent(searchText.value)}`, time: formatTime() }]))
  } else if (Cookies.get('accepted') === 'false') {
    message.warning('You have declined our cookies. Your search history will not be saved.')
  } else if (privateb.value) {
    message.warning('Private mode is on. Your search history will not be saved.')
  }
  privateb.value = false
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
