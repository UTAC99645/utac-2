<template>
  <!-- 首页组件模板 -->
  <!-- 加载动画 -->
  <div v-if="spinShow">
    <n-image :src="lodimg" style="width: 100vw" alt="Loading" />
    <!-- <n-empty description="无数据" /> -->
  </div>
  <!-- 主内容区域 -->
  <div v-else>
    <!-- 搜索页面（非链接模式） -->
    <div v-if="!onLink">
      <title type="info">UTAC'S Sesrch</title>
      <!-- 搜索类型选择 -->
      <n-flex justify="space-around">
        <div class="typekey" v-for="[key, item] in typeMap">
          <n-button :dashed="!(search_type === key)" ghost type="error" size="large" @click="search_type = key">
            {{ key }}
          </n-button>
        </div>
      </n-flex>
      <n-divider />
      <!-- 搜索内容区 -->
      <div class="page">
        <h1 class="title">
          {{ Hello }}
        </h1>
        <!-- 普通搜索输入框 -->
        <div v-if="!QR">
          <form @submit.prevent="searchfin">
            <n-input round status='info' loading clearable size="large" v-model:value="searchText" type="text"
              id="Search" placeholder="Search" />
          </form>
        </div>
        <!-- QR 模式输入框 -->
        <div v-else>
          <n-input round status='info' :type="inputtype" :loading="inputLod" clearable size="large"
            v-model:value="searchText" type="text" id="Search" placeholder="context" />
        </div>
        <n-divider />
        <!-- QR 码展示区 -->
        <n-flex v-show="QR" justify="center" style="margin-top: 20px">
          <div>
            <!-- 纠错等级选择 -->
            <n-button v-for="item in QRc" type="error" size="small"
              @click="() => { QRck = item.value, message.warning(`Set QR code error correction level to ${item.value}`) }">
              {{ item.label }}
            </n-button>
          </div>
          <n-divider style="height: 3vh">
            <n-divider vertical />
            <!-- 额外选项开关 -->
            <n-switch id="1" v-model:value="extra_on" size="large">
              <template #checked>N</template>
              <template #unchecked>U</template>
            </n-switch>
            <n-divider vertical />
            <!-- QR 下载按钮 -->
            <n-button @click="QRdownload" type="success" size="small">
              Download
            </n-button>
            <n-divider v-show="extra_on & searchLCfqt === 'Link'" vertical />
            <!-- 链接打开选项 -->
            <n-switch v-show="extra_on & searchLCfqt === 'Link'" id="2" v-model:value="extra_1_on" size="large">
              <template #checked>O</template>
              <template #unchecked>NO</template>
            </n-switch>
            <n-divider v-show="extra_on & searchLCfqt === 'Link'" vertical />
          </n-divider>
          <!-- 额外搜索类型选择 -->
          <n-flex v-show="extra_on">
            <n-button :type="(key === searchLCfqt) ? 'primary' : 'default'" @click="() => { searchLCfqt = key }"
              v-for="[key, item] in typeMap">
              {{ key }}
            </n-button>
          </n-flex>
          <!-- QR 码组件 -->
          <n-qr-code id="qrcode" :padding="0" :value="searchLCfq" :error-correction-level="QRck" :size="100" />
        </n-flex>
        <!-- 一言卡片列表 -->
        <div v-if="yiyandata" v-for="(value, index) in yiyandata" :key="index">
          <n-card class="n-card" embedded :bordered="false" size="small" hoverable>
            <template #header>
              <div v-if="!(value.from_who === null)">
                by: {{ value.from_who }}
              </div>
              <div v-else>
                ...
              </div>
            </template>
            <template v-if="!(value.from === null)" #header-extra>
              from: {{ value.from }}
            </template>
            {{ value.hitokoto }}
            <template #action>
              ID: {{ value.id }}
            </template>
          </n-card>
          <n-divider v-if="!(index + 1 === yiyandata.length)" />
        </div>
      </div>
    </div>
    <!-- 链接预览模式 -->
    <div v-else>
      <n-flex justify="space-around">
        <!-- 返回按钮 -->
        <n-button type="warning" size="large" dashed
          @click="() => { typeMap.set('Link', { ...typeMap.get('Link'), on: false }) }">
          Back
        </n-button>
      </n-flex>
      <!-- 文件预览组件 -->
      <Rader :url="searchText" />
    </div>
  </div>
</template>

<script setup>
// 引入 naive-ui 消息组件
import { useMessage } from 'naive-ui'
// 引入文件预览组件
import Rader from './Link.vue'
// 引入首页样式
import "../css/home.css"
// 引入 Vue 组合式 API
import { computed, nextTick, ref } from 'vue'
// 引入 Axios
import axios from 'axios'

// 搜索链接地址
const search_link = ref("")
// 搜索文本
const searchText = ref('')
// 加载动画显示状态
const spinShow = ref(false)
// 是否为 QR 模式
const QR = computed(() => {
  return typeMap.value.get('QR').en
})
// QR 纠错等级选项
const QRc = ref([
  { value: 'L', label: 'L' },
  { value: 'M', label: 'M' },
  { value: 'Q', label: 'Q' },
  { value: 'H', label: 'H' }
])
// 当前 QR 纠错等级
const QRck = ref('L')
// 搜索类型缓存
const search_type_cache = ref('duckduckgo')
// 搜索类型（计算属性，支持 rlyiyan 特殊处理）
const search_type = computed({
  get() {
    return search_type_cache.value
  },
  set(value) {
    if (value === 'rlyiyan') {
      yiyan()
      return 0
    } else {
      if (value === search_type_cache) {
        return 0
      } else {
        search_type_cache.value = value
        message.info(`search with ${value}`)
      }
    }

  }
})
// 消息提示实例
const message = useMessage()
// 加载条实例
const loadingBar = useLoadingBar()
// URL 匹配正则
const urlMatch = /^https?:\/\/.+\..+/i
// 加载图片（随机选择）
const lodimg = computed(() => {
  let x = Random()
  if (x >= 50) {
    return localmap.value.get('Evil').url
  } else {
    return localmap.value.get('Neuro').url
  }
})

// 加载图片映射
const localmap = ref(new Map([
  ['Evil', { url: '/assets/img/lod/Evil.gif' }],
  ['Neuro', { url: '/assets/img/lod/Neuro.gif' }]
]))

// 搜索类型配置映射
const typeMap = ref(new Map([
  ['google', { en: true, url: 'https://www.google.com/search?q=' }],
  ['bing', { en: false, url: 'https://www.bing.com/search?q=' }],
  ['duckduckgo', { en: false, url: 'https://duckduckgo.com/?q=' }],
  ['Link', { en: false, on: false, url: 'https://utac99645.top/?q=' }],
  ['QR', { en: false, on: null, url: '' }],
  ['rlyiyan', { en: null, on: null, url: null }]
]))
// 类型键列表
const keys = [...typeMap.value.keys()]
// 当前路由
const route = useRoute()
// 随机数生成
const Random = () => Math.ceil(Math.random() * 100)
// 路由操作实例
const router = useRouter()
// 睡眠函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
// 是否为链接搜索模式
const Link = computed(() => {
  return typeMap.value.get('Link').en
})
// 是否显示链接预览
const onLink = computed(() => {
  return typeMap.value.get('Link').on
})
// 搜索链接拼接
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
// 额外参数拼接后的搜索链接
const searchLCfq = computed(() => {
  let x = ''
  x = `${extra.value}${searchLC.value}${extra_1.value}`
  return x
})
// 额外搜索类型
const searchLCfqt = ref('DuckDuckGo')
// 额外参数开关
const extra_on = ref(false)
// 额外前缀
const extra = computed(() => {
  let x = typeMap?.value.get(searchLCfqt.value)?.url ?? ''
  if (extra_on.value) {
    return x
  } else {
    return ''
  }
})
// 额外后缀开关
const extra_1_on = ref(false)
// 额外后缀参数
const extra_1 = computed(() => {
  if (extra_1_on.value & extra_on.value & searchLCfqt.value === 'Link') {
    return "&type=Link&open=true"
  } else {
    return ''
  }
})
// 输入框类型
const inputtype = computed(() => {
  if (search_type.value === 'QR') {
    return 'textarea'
  } else {
    return 'text'
  }
})
// 输入框加载状态
const inputLod = computed(() => {
  if (search_type.value === 'QR') {
    return false
  } else {
    return true
  }
})
// 页面标题
const Hello = ref("UTAC's search")
// 一言数据
const yiyandata = ref([])

// 获取一言数据
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
  return yiyandata.value.unshift(x)
}

// 组件挂载初始化
onMounted(() => {
  init()
  yiyan()
})

// 初始化函数
async function init() {
  initLaod()
  if (route.params.type) {
    checkUrl()
  }
}

// 加载动画
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

// 监听搜索类型变化
watch(search_type, () => { search_change(), makeUrl() }, { immediate: true, deep: true })

// 监听搜索文本变化，同步到 URL
watch(searchText, () => { router.replace({ query: { ...route.query, q: searchText.value } }) })

// 搜索提交处理
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

// 搜索类型切换
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

// 更新 URL 参数
async function makeUrl() {
  router.push({
    name: 'Home',
    params: {
      type: search_type.value
    }
  })
}

// 检查 URL 参数
function checkUrl() {
  if (route.query.q) searchText.value = route.query.q
  let { open } = route.query
  let type = route.params.type
  if (open) {
    search_type.value = type
    nextTick(() => {
      searchfin()
    })
    return
  }

  search_type.value = type
}

// 下载 QR 码图片
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
