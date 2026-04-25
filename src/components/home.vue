<template>
  <!-- ========================================================== -->
  <!-- 首页组件
       功能：
       1. 多引擎搜索（动态加载自 JSON 配置）
       2. QR 码生成与下载
       3. 链接预览（内嵌文件查看器）
       4. 一言（Hitokoto）随机展示
  -->
  <!-- ========================================================== -->

  <!-- ---------- 加载动画 ---------- -->
  <div v-if="spinShow">
    <n-image :src="lodimg" style="width: 100vw" alt="Loading" />
  </div>

  <!-- ---------- 主内容 ---------- -->
  <div v-else>

    <!-- ==================== 搜索页 ==================== -->
    <div v-if="!onLink">
      <title type="info">UTAC'S Search</title>
      <h1 class="title">{{ Hello }}</h1>

      <!-- 搜索输入区 -->
      <div v-if="!QR">
        <form @submit.prevent="searchfin">
          <n-input-group>
            <n-select style="width: 25%" v-model:value="search_type" :options="searchkey" size="large" />
            <n-input style="width: 75%" v-model:value="searchText" clearable size="large" />
          </n-input-group>
        </form>
      </div>

      <!-- QR 模式输入框 -->
      <div v-else>
        <n-input
          round
          status="info"
          :type="inputtype"
          :loading="inputLod"
          clearable
          size="large"
          v-model:value="searchText"
          type="text"
          id="Search"
          placeholder="context"
        />
      </div>

      <n-divider />

      <!-- 搜索引擎快捷切换 -->
      <n-flex justify="space-around">
        <div class="typekey" v-for="[key, item] in keyMap" :key="key">
          <n-button
            :dashed="!(search_type === key)"
            ghost
            type="error"
            size="large"
            @click="() => {
              if (key === search_type) {
                search_type = 'duckduckgo'
              } else { search_type = key }
            }"
          >
            {{ key === search_type ? 'Back' : key }}
          </n-button>
        </div>
      </n-flex>

      <n-divider />

      <div class="page">
        <!-- ==================== QR 码区域 ==================== -->
        <n-flex v-show="QR" justify="center" style="margin-top: 20px">

          <!-- 纠错等级 -->
          <div>
            <n-button
              v-for="item in QRc"
              :key="item.value"
              type="error"
              size="small"
              @click="() => { QRck = item.value; message.warning(`Set QR code error correction level to ${item.value}`); }"
            >
              {{ item.label }}
            </n-button>
          </div>

          <n-divider style="height: 3vh">
            <n-divider vertical />
            <n-switch id="1" v-model:value="extra_on" size="large">
              <template #checked>N</template>
              <template #unchecked>U</template>
            </n-switch>
            <n-divider vertical />
            <n-button @click="QRdownload" type="success" size="small">Download</n-button>
            <n-divider v-show="extra_on && searchLCfqt === 'Link'" vertical />
            <n-switch v-show="extra_on && searchLCfqt === 'Link'" id="2" v-model:value="extra_1_on" size="large">
              <template #checked>O</template>
              <template #unchecked>NO</template>
            </n-switch>
            <n-divider v-show="extra_on && searchLCfqt === 'Link'" vertical />
          </n-divider>

          <!-- 额外搜索类型选择 -->
          <n-flex v-show="extra_on">
            <n-button
              v-for="[key, item] in fullMap"
              :key="key"
              :type="(key === searchLCfqt) ? 'primary' : 'default'"
              @click="() => { searchLCfqt = key }"
            >
              {{ key }}
            </n-button>
          </n-flex>

          <!-- QR 码组件 -->
          <n-qr-code
            id="qrcode"
            :padding="0"
            :value="searchLCfq"
            :error-correction-level="QRck"
            :size="325"
          />
          <n-divider />
        </n-flex>

        <!-- ==================== 一言卡片 ==================== -->
        <div v-if="yiyandata" v-for="(value, index) in yiyandata" :key="index">
          <n-card class="n-card" embedded :bordered="false" size="small" hoverable>
            <template #header>
              <div v-if="value.from_who !== null">by: {{ value.from_who }}</div>
              <div v-else>...</div>
            </template>
            <template v-if="value.from !== null" #header-extra>from: {{ value.from }}</template>
            {{ value.hitokoto }}
            <template #action>
              ID: {{ value.id }}
              <n-divider vertical />
              <n-button @click="yiyan()" :loading="yiyan_lock_cache" :disabled="yiyan_lock_cache">
                GET AOTHER
              </n-button>
            </template>
          </n-card>
          <n-divider v-if="index + 1 !== yiyandata.length" />
        </div>
      </div>
    </div>

    <!-- ==================== 链接预览模式 ==================== -->
    <div v-else>
      <Rader :url="searchText" @back="exitLinkPreview" />
    </div>
  </div>
</template>

<script setup>
// ============================================================
// 首页脚本
// ============================================================

// ---------- 外部依赖 ----------
import { useMessage, useLoadingBar } from 'naive-ui';
// ---------- Link 预览组件（异步加载，避免打包大型依赖） ----------
const Rader = defineAsyncComponent(() => import('./Link.vue'));
import '../css/home.css';
import { computed, nextTick, ref, watch, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

// ---------- 搜索引擎 JSON 配置 ----------
import typeMap_src from '../addition/searchWay.json';
import keyMap_src  from '../addition/searchKey.json';

// ============================================================
// 常量 & 工具函数
// ============================================================

const urlMatch = /^https?:\/\/.+\..+/i;

const Random = () => Math.ceil(Math.random() * 100);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// 响应式数据
// ============================================================

// --- 搜索相关 ---
const search_link       = ref('');
const searchText        = ref('');
const search_type_cache = ref('duckduckgo');
const searchLCfqt       = ref('DuckDuckGo');

// --- UI 状态 ---
const spinShow = ref(false);
const extra_on = ref(false);
const extra_1_on = ref(false);

// --- 页面标题控制 ---
const heltoyi = ref(false);

// --- 加载图片映射 ---
const localmap = ref(new Map([
  ['Evil',  { url: '/assets/img/lod/Evil.gif'  }],
  ['Neuro', { url: '/assets/img/lod/Neuro.gif' }]
]));

// --- 搜索引擎配置映射（由 JSON 初始化） ---
// key: 引擎名称
// value:
//   - en:   是否激活（boolean）
//   - on:   Link 模式专用，是否进入预览（boolean | null）
//   - url:  搜索前缀（string | null）
const typeMap = ref(new Map(typeMap_src));
const keyMap  = ref(new Map(keyMap_src));
const fullMap = ref(new Map([...typeMap_src, ...keyMap_src]));

const keys = [...fullMap.value.keys()];

// --- QR 码配置 ---
const QRc = ref([
  { value: 'L', label: 'L' },
  { value: 'M', label: 'M' },
  { value: 'Q', label: 'Q' },
  { value: 'H', label: 'H' }
]);
const QRck = ref('L');

// --- 一言数据 ---
const yiyandata = ref([{
  hitokoto: '加载中喵~',
  from: '',
  from_who: ''
}]);

const yiyan_lock_cache = ref(false);

// ============================================================
// naive-ui / Router 实例
// ============================================================

const message    = useMessage();
const loadingBar = useLoadingBar();
const route      = useRoute();
const router     = useRouter();

// ============================================================
// 计算属性
// ============================================================

// --- 当前是否为 QR 模式 ---
const QR = computed(() => fullMap.value.get('QR').en);

// --- 当前是否为 Link 搜索模式 ---
const Link = computed(() => fullMap.value.get('Link').en);

// --- 是否显示链接预览 ---
const onLink = computed(() => fullMap.value.get('Link').on);

// --- 页面标题（1.5s 后切换为一言） ---
const Hello = computed(() => {
  let x = "UTAC's search";
  if (heltoyi.value) {
    x = yiyan_word.value;
    console.log(x);
  }
  return x;
});

// --- 当前一言句子 ---
const yiyan_word = computed(() => {
  let x = '';
  x = yiyandata.value[0].hitokoto ?? '';
  return x;
});

// --- 下拉选择器选项（由 fullMap 动态生成） ---
const searchkey = computed(() => {
  let x = Object.entries(Object.fromEntries(fullMap.value));
  let a = [];
  for (let [key, _item] of x) {
    a.push({
      label: key,
      value: key
    });
  }
  return a;
});

// --- 搜索链接拼接 ---
const searchLC = computed(() => {
  if (search_type.value === 'QR') {
    return searchText.value;
  }
  const type = fullMap.value?.get(search_type.value)?.url ?? '';
  return `${type}${searchText.value}`;
});

// --- 额外前缀 ---
const extra = computed(() => {
  if (!extra_on.value) return '';
  return fullMap.value?.get(searchLCfqt.value)?.url ?? '';
});

// --- 额外后缀 ---
const extra_1 = computed(() => {
  if (extra_1_on.value & extra_on.value & searchLCfqt.value === 'Link') {
    return '&type=Link&open=true';
  } else {
    return '';
  }
});

// --- 带额外参数的完整搜索链接 ---
const searchLCfq = computed(() => `${extra.value}${searchLC.value}${extra_1.value}`);

// --- 搜索类型（读写计算属性） ---
// 特殊处理 rlyiyan：切换时自动获取一言，不更新缓存
const search_type = computed({
  get() {
    return search_type_cache.value;
  },
  set(value) {
    if (value === 'rlyiyan') {
      yiyan();
      return 0;
    } else {
      if (value === search_type_cache.value) {
        return 0;
      } else {
        search_type_cache.value = value;
        message.info(`By ${value}`);
      }
    }
  }
});

// --- 输入框类型（QR 模式用 textarea） ---
const inputtype = computed(() => {
  if (search_type.value === 'QR') {
    return 'textarea';
  } else {
    return 'text';
  }
});

// --- 输入框加载状态（QR 模式不显示加载） ---
const inputLod = computed(() => {
  if (search_type.value === 'QR') {
    return false;
  } else {
    return true;
  }
});

// --- 随机加载图片 ---
const lodimg = computed(() => {
  const x = Random();
  return x >= 50
    ? localmap.value.get('Evil').url
    : localmap.value.get('Neuro').url;
});

// ============================================================
// 方法
// ============================================================

/**
 * 获取一言（Hitokoto）数据并替换当前展示
 */
async function yiyan() {
  yiyan_lock_cache.value = true;
  console.log('start get yiyan');
  loadingBar.start();
  let x = '';
  await axios.get('https://v1.hitokoto.cn')
    .then(res => {
      x = res.data;
      console.log(x);
      loadingBar.finish();
    })
    .catch(err => {
      message.error(`Get yiyan error with: ${err}`);
      loadingBar.error();
      return 0;
    });
  yiyandata.value.unshift(x);
  if (yiyandata.value.length > 1) {
    yiyandata.value = yiyandata.value.slice(0, 1);
  }
  await yiyan_lock();
}

/**
 * 一言冷却锁（1.5s）
 */
async function yiyan_lock() {
  console.log('yiyan is locking');
  await sleep(1500);
  yiyan_lock_cache.value = false;
  console.log('unlocked');
}

/**
 * 初始化入口
 */
async function init() {
  initLaod();
  if (route.params.type) {
    checkUrl();
  }
}

/**
 * 加载动画
 * 随机决定是否显示加载图（约 50% 概率）
 */
async function initLaod(Num) {
  loadingBar.start();
  spinShow.value = true;
  let x = Num ?? 50;
  if (x <= Random()) {
    await sleep(1);
    spinShow.value = false;
    loadingBar.error();
    return;
  } else {
    await sleep(1);
    spinShow.value = false;
    loadingBar.finish();
    return;
  }
}

/**
 * 搜索提交
 * 逻辑分支：
 *   1. 空输入 -> 提示
 *   2. Link 模式 -> 进入内嵌预览
 *   3. 直接输入 URL -> 新标签打开
 *   4. 普通搜索词 -> 拼接搜索链接后新标签打开
 */
function searchfin() {
  if (!searchText.value.trim()) {
    message.warning('Nothing to search');
    return;
  }
  if (Link.value) {
    fullMap.value.set('Link', { ...fullMap.value.get('Link'), on: true });
    message.success(`Link to '${searchText.value}'`);
    return 0;
  } else if (urlMatch.test(searchText.value)) {
    window.open(searchText.value);
  } else {
    window.open(searchLC.value, '_blank');
  }
}

/**
 * 切换搜索引擎时更新激活状态
 */
async function search_change() {
  loadingBar.start();
  for (let [key, _item] of fullMap.value) {
    if (key === search_type.value) {
      fullMap.value.set(key, { ...fullMap.value.get(key), en: true });
    } else {
      fullMap.value.set(key, { ...fullMap.value.get(key), en: false });
    }
  }
  initLaod();
}

/**
 * 更新浏览器 URL 参数（params.type）
 */
async function makeUrl() {
  router.push({
    name: 'Home',
    params: { type: search_type.value }
  });
}

/**
 * 根据路由参数恢复搜索状态
 */
function checkUrl() {
  if (route.query.q) {
    searchText.value = route.query.q;
  }
  const { open } = route.query;
  const type = route.params.type;
  if (open) {
    search_type.value = type;
    nextTick(() => searchfin());
    return;
  }
  search_type.value = type;
}

/**
 * 退出链接预览模式
 */
function exitLinkPreview() {
  fullMap.value.set('Link', { ...fullMap.value.get('Link'), on: false });
}

/**
 * 下载当前生成的 QR 码图片
 */
function QRdownload() {
  const canvas = document.querySelector('#qrcode')?.querySelector('canvas');
  if (canvas) {
    const link = canvas.toDataURL();
    const a = document.createElement('a');
    a.download = 'qrcode.png';
    a.href = link;
    document.body.appendChild(a);
    a.click();
    a.remove();
    url.revokeObjectURL(link);
  }
}

// ============================================================
// 生命周期 & 监听器
// ============================================================

onMounted(async () => {
  init();
  yiyan();
  await sleep(1500);
  heltoyi.value = true;
});

// 搜索类型变化 -> 更新引擎状态 + 同步 URL
watch(search_type, () => { search_change(); makeUrl(); }, { immediate: true, deep: true });

// 搜索文本变化 -> 同步到 URL query
watch(searchText, () => {
  router.replace({ query: { ...route.query, q: searchText.value } });
});
</script>
