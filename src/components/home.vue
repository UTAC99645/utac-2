<template>
  <div v-if="spinShow">
    <n-image :src="lodimg" style="width: 100vw" alt="Loading" />
  </div>
  <div v-else>
    <div v-if="!onLink">
      <title type="info">UTAC'S Sesrch</title>
      <n-flex justify="space-around">
        <div v-for="[key, item] in typeMap">
          <n-button :type="search_type === key ? 'info' : 'warning'" size="large"
            @click="() => { if (key === search_type) { return } else search_type = key, message.warning(`Search with ${key}`) }">
            {{ key }}
          </n-button>
        </div>
      </n-flex>
      <n-divider />
      <div class="page">
        <h1 class="title">
          {{ Hello }}
        </h1>
        <div v-if="!QR" class="search-box">
          <form @submit.prevent="searchfin">
            <n-input round status='info' loading clearable size="large" v-model:value="searchText" type="text"
              id="Search" placeholder="Search" />
          </form>
        </div>
        <div v-else>
          <n-input round status='info' :type="inputtype" :loading="inputLod" clearable size="large"
            v-model:value="searchText" type="text" id="Search" placeholder="context" />
        </div>
        <n-flex v-show="QR" justify="center" style="margin-top: 20px">
          <n-button v-for="item in QRc" type="error" size="small"
            @click="() => { QRck = item.value, message.warning(`Set QR code error correction level to ${item.value}`) }">
            {{ item.label }}
          </n-button>
          <n-divider style="height: 3vh">
            <n-divider vertical />
            <n-switch id="1" v-model:value="extra_on" size="large">
              <template #checked>N</template>
              <template #unchecked>U</template>
            </n-switch>
            <n-divider vertical />
            <n-button @click="QRdownload" type="success" size="small">
              Download
            </n-button>
            <n-divider v-show="extra_on & searchLCfqt === 'Link'" vertical />
            <n-switch v-show="extra_on & searchLCfqt === 'Link'" id="2" v-model:value="extra_1_on" size="large">
              <template #checked>O</template>
              <template #unchecked>NO</template>
            </n-switch>
            <n-divider v-show="extra_on & searchLCfqt === 'Link'" vertical />
          </n-divider>
          <n-flex v-show="extra_on">
            <n-button :type="(key === searchLCfqt) ? 'primary' : 'default'" @click="() => { searchLCfqt = key }"
              v-for="[key, item] in typeMap">
              {{ key }}
            </n-button>
          </n-flex>
          <n-qr-code id="qrcode" :padding="0" :value="searchLCfq" :error-correction-level="QRck" :size="100" />
        </n-flex>
        {{ yiyandata }}
        <div v-if="yiyandata">
          <n-card size="small" hoverable>
            <template #header>
              <div v-if="!(yiyandata.from_who === null)">
                by: {{ yiyandata.from_who }}
              </div>
              <div v-else>
                ...
              </div>
            </template>
            <template v-if="!(yiyandata.from === null)" #header-extra>
              from: {{ yiyandata.from }}
            </template>
            {{ yiyandata.hitokoto }}
            <template #action>
              ID: {{ yiyandata.id }}
            </template>
          </n-card>
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
  </div>
</template>

<script setup>
import { useMessage } from 'naive-ui'
import Rader from './Link.vue'
import "./home.css"
import { computed, nextTick, ref } from 'vue'
import axios from 'axios'
const search_link = ref("")
const searchText = ref('')
const spinShow = ref(false)
const QR = computed(() => {
  return typeMap.value.get('QR').en
})
const QRc = ref([
  { value: 'L', label: 'L' },
  { value: 'M', label: 'M' },
  { value: 'Q', label: 'Q' },
  { value: 'H', label: 'H' }
])
const QRck = ref('L')
const search_type = ref('duckduckgo')
const message = useMessage()
const loadingBar = useLoadingBar()
const urlMatch = /^https?:\/\/.+\..+/i
const lodimg = computed(() => {
  let x = Random()
  if (x >= 50) {
    return localmap.value.get('Evil').url
  } else {
    return localmap.value.get('Neuro').url
  }
})

const localmap = ref(new Map([
  ['Evil', { url: '/assets/img/lod/Evil.gif' }],
  ['Neuro', { url: '/assets/img/lod/Neuro.gif' }]
]))

const typeMap = ref(new Map([
  ['google', { en: true, url: 'https://www.google.com/search?q=' }],
  ['bing', { en: false, url: 'https://www.bing.com/search?q=' }],
  ['duckduckgo', { en: false, url: 'https://duckduckgo.com/?q=' }],
  ['Link', { en: false, on: false, url: 'https://utac99645.top/?q=' }],
  ['QR', { en: false, url: '' }]
]))
const keys = [...typeMap.value.keys()]
const route = useRoute()
const Random = () => Math.ceil(Math.random() * 100)
const router = useRouter()
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const Link = computed(() => {
  return typeMap.value.get('Link').en
})
const onLink = computed(() => {
  return typeMap.value.get('Link').on
})
const searchLC = computed(() => {
  let x = ''
  let type = typeMap.value?.get(search_type.value).url
  if (search_type.value === 'QR') {
    x = searchText.value
  } else {
    x = `${type}${searchText.value}`
  }
  return x
})
const searchLCfq = computed(() => {
  let x = ''
  x = `${extra.value}${searchLC.value}${extra_1.value}`
  return x
})
const searchLCfqt = ref('DuckDuckGo')
const extra_on = ref(false)
const extra = computed(() => {
  let x = typeMap?.value.get(searchLCfqt.value)?.url ?? ''
  if (extra_on.value) {
    return x
  } else {
    return ''
  }
})
const extra_1_on = ref(false)
const extra_1 = computed(() => {
  if (extra_1_on.value & extra_on.value & searchLCfqt.value === 'Link') {
    return "&type=Link&open=true"
  } else {
    return ''
  }
})
const inputtype = computed(() => {
  if (search_type.value === 'QR') {
    return 'textarea'
  } else {
    return 'text'
  }
})
const inputLod = computed(() => {
  if (search_type.value === 'QR') {
    return false
  } else {
    return true
  }
})
const Hello = ref("UTAC's search")
const yiyandata = ref({})

async function yiyan() {
  loadingBar.start()
  let x = ""
  await axios.get('https://v1.hitokoto.cn')
    .then(res => {
      x = res.data
      console.log(x)
      loadingBar.finish()
    })
    .catch(err => {
      message.error(`Get yiyan error with:${err}`)
      loadingBar.error()
    })
  return yiyandata.value = x
}

onMounted(() => {
  init()
  yiyan()
})

async function init() {
  initLaod()
  if (route.query.type) {
    checkUrl()
  } else {
    search_change(search_type.value)
  }
}

async function initLaod(Num) {
  loadingBar.start()
  spinShow.value = true
  let x = Num ?? 50
  if (x <= Random()) {
    await sleep(1)
    spinShow.value = false
    loadingBar.error()
    return
  } else {
    await sleep(1)
    spinShow.value = false
    loadingBar.finish()
    return
  }
}

watch(search_type, () => { search_change(), makeUrl() }, { immediate: true, deep: true })

watch(searchText, () => { router.replace({ query: { ...route.query, q: searchText.value } }) })

function searchfin() {
  if (!searchText.value.trim()) {
    message.warning('Nothing to search');
    return;
  }
  if (Link.value) {
    typeMap.value.set('Link', { ...typeMap.value.get('Link'), on: true })
    message.success(`Link to '${searchText.value}'`)
    return 0
  } else if (urlMatch.test(searchText.value)) {
    window.open(searchText.value);
  } else {
    window.open(searchLC.value, `_blank`);
  }
}

async function search_change() {
  loadingBar.start()
  keys.forEach(key => {
    if (key === search_type.value) {
      typeMap.value.set(key, { ...typeMap.value.get(search_type.value), en: true })
    } else {
      typeMap.value.set(key, { ...typeMap.value.get(key), en: false })
    }
    search_link.value = typeMap.value.get(search_type.value).url
  })
  initLaod()
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

function QRdownload() {
  const canvas = document.querySelector('#qrcode')?.querySelector('canvas')
  if (canvas) {
    const link = canvas.toDataURL()
    const a = document.createElement('a')
    a.download = 'qrcode.png'
    a.href = link
    document.body.appendChild(a)
    a.click()
    a.remove()
    url.revokeObjectURL(link)
  }
}
</script>
