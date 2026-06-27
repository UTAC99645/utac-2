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
        <n-input round :type="inputtype" :loading="inputLod" clearable size="large" v-model:value="searchText"
          id="Search" placeholder="context" />
      </div>

      <n-divider />

      <!-- 搜索引擎快捷切换 -->
      <n-flex justify="space-around">
        <div class="typekey" v-for="[key] in keyMap" :key="key">
          <n-button :dashed="!(search_type === key)" ghost type="error" size="large" @click="() => {
            if (key === search_type) {
              search_type = 'duckduckgo'
            } else { search_type = key }
          }">
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
            <n-button v-for="item in QRc" :key="item.value" type="error" size="small"
              @click="() => { QRck = item.value; message.warning(`Set QR code error correction level to ${item.value}`); }">
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
            <n-button v-for="[key] in fullMap" :key="key" :type="(key === searchLCfqt) ? 'primary' : 'default'"
              @click="() => { searchLCfqt = key }">
              {{ key }}
            </n-button>
          </n-flex>

          <!-- QR 码组件 -->
          <n-qr-code id="qrcode" :padding="0" :value="searchLCfq" :error-correction-level="QRck" :size="325" />
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

<script setup lang="ts">
// ============================================================
// 首页脚本
// ============================================================

// ---------- 外部依赖 ----------
import { useMessage, useLoadingBar } from 'naive-ui';
import { EngineConfig, YiyanItem } from '@/ts/type';
// ---------- Link 预览组件（异步加载，避免打包大型依赖） ----------
const Rader = defineAsyncComponent(() => import('./Link.vue'));
import '../css/home.css';
import { computed, nextTick, ref, watch, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

// ---------- 搜索引擎 JSON 配置 ----------

import typeMap_Rsrc from "../addition/searchWay.json";
import keyMap_Rsrc from "../addition/searchKey.json";

const typeMap_src = typeMap_Rsrc as [string, EngineConfig][]
const keyMap_src = keyMap_Rsrc as [string, EngineConfig][]

// ============================================================
// 常量 & 工具函数
// ============================================================

const urlMatch: RegExp = /^https?:\/\/.+\..+/i;

const sleep: Function = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// 响应式数据
// ============================================================

// --- 搜索相关 ---
const searchText = ref<string>('');
const search_type_cache = ref('duckduckgo');
const searchLCfqt = ref('DuckDuckGo');

// --- UI 状态 ---
const spinShow = ref(false);
const extra_on = ref(false);
const extra_1_on = ref(false);

// --- 页面标题控制 ---
const heltoyi = ref(false);

// --- 加载图片映射 ---
const localmap = new Map([
  ['Evil', { url: '/assets/img/lod/Evil.gif' }],
  ['Neuro', { url: '/assets/img/lod/Neuro.gif' }]
]);

// --- 搜索引擎配置映射（由 JSON 初始化） ---
// key: 引擎名称
// value:
//   - en:   是否激活（boolean）
//   - on:   Link 模式专用，是否进入预览（boolean | null）
//   - url:  搜索前缀（string | null）
const keyMap = ref<Map<string, EngineConfig>>(new Map(keyMap_src));
const fullMap = ref<Map<string, EngineConfig>>(new Map([...typeMap_src, ...keyMap_src]));

const fullMap_src = ref<[string, EngineConfig][]>([...typeMap_src, ...keyMap_src]);

const typeArr = computed<string>(() => {
  let rs: string
  let key: any[] = fullMap_src.value.map(item => item[0])
  rs = key.join("|");
  return rs;
});
console.log(typeArr.value)
// --- QR 码配置 ---
const QRc: { value: string, label: string }[] = [
  { value: 'L', label: 'L' },
  { value: 'M', label: 'M' },
  { value: 'Q', label: 'Q' },
  { value: 'H', label: 'H' }
];
const QRck = ref('L');

// --- 一言数据 ---
const yiyandata = ref<YiyanItem[]>([{
  hitokoto: '加载中喵~',
  from: '',
  from_who: ''
}]);

const yiyan_lock_cache = ref<boolean>(false);

// ============================================================
// naive-ui / Router 实例
// ============================================================

const message = useMessage();
const loadingBar = useLoadingBar();
const route = useRoute();
const router = useRouter();

// ============================================================
// 计算属性
// ============================================================

// --- 当前是否为 QR 模式 ---
const QR = computed<boolean>(() => fullMap.value.get('QR')!.en);

// --- 当前是否为 Link 搜索模式 ---
const Link = computed<boolean>(() => fullMap.value.get('Link')!.en);

// --- 是否显示链接预览 ---
const onLink = computed<boolean>(() => fullMap.value.get('Link')!.on ?? false);

// --- 页面标题（1.5s 后切换为一言） ---
const Hello = computed<string>(() => heltoyi.value ? yiyan_word.value : "UTAC's search");

// --- 当前一言句子 ---
const yiyan_word = computed<string>(() => yiyandata.value[0]?.hitokoto ?? '');

// --- 搜索类型下拉选项（由 fullMap 动态生成，供 n-select 使用） ---
const searchkey = computed<{ value: string, label: string }[]>(() =>
  [...fullMap.value.keys()].map(key => ({ value: key, label: key }))
);

// --- 搜索链接拼接 ---
const searchLC = computed<string>(() => {
  if (search_type.value === 'QR') {
    return searchText.value;
  }
  const type = fullMap.value.get(search_type.value)?.url ?? '';
  return `${type}${searchText.value}`;
});

// --- 额外前缀 ---
const extra = computed<string>(() => {
  if (!extra_on.value) return '';
  return fullMap.value.get(searchLCfqt.value)?.url ?? '';
});

// --- 额外后缀 ---
const extra_1 = computed<string>(() => {
  if (extra_1_on.value && extra_on.value && searchLCfqt.value === 'Link') {
    return '&type=Link&open=true';
  }
  return '';
});

// --- 带额外参数的完整搜索链接 ---
const searchLCfq = computed<string>(() => `${extra.value}${searchLC.value}${extra_1.value}`);

// --- 搜索类型（读写计算属性） ---
// 特殊处理 rlyiyan：切换时自动获取一言，不更新缓存
const search_type = computed<string>({
  get() {
    return search_type_cache.value;
  },
  set(value) {
    if (value === 'rlyiyan') {
      yiyan();
      return;
    }
    if (value !== search_type_cache.value) {
      search_type_cache.value = value;
      if (!route.query.open) message.info(`By ${value}`);
    }
  }
});

// --- 输入框类型（QR 模式用 textarea） ---
const inputtype = computed<'text' | 'textarea'>(() => search_type.value === 'QR' ? 'textarea' : 'text');

// --- 输入框加载状态（QR 模式不显示加载） ---
const inputLod = computed<boolean>(() => search_type.value !== 'QR');

// --- 随机加载图片 ---
const lodimg = computed<string>(() =>
  localmap.get(Math.random() > 0.5 ? 'Evil' : 'Neuro')!.url
);

// ============================================================
// 方法
// ============================================================

/**
* 获取一言（Hitokoto）数据并替换当前展示
* 冷却时间：2s（通过 yiyan_lock_cache 控制按钮状态）
*/
async function yiyan(): Promise<void> {
  yiyan_lock_cache.value = true;
  console.log('start get yiyan');
  loadingBar.start();
  let x: YiyanItem = yiyandata.value[1];
  await axios.get('https://v1.hitokoto.cn')
    .then(res => {
      x = res.data;
      console.log(res);
      loadingBar.finish();
    })
    .catch(err => {
      message.error(`Get yiyan error with: ${err}`);
      loadingBar.error();
    });
  await sleep(2000);
  yiyan_lock_cache.value = false;
  if (x === yiyandata.value[1]) {
    await yiyan()
  } else {
    yiyandata.value = [x]
  }
}

/**
* 初始化入口
*/
async function init() {
  initLaod();
  if (route.params.type) checkUrl();
}

/**
* 加载动画
* 随机决定是否显示加载图（约 50% 概率）
*/
async function initLaod(Num: number = 50) {
  loadingBar.start();
  spinShow.value = true;
  await sleep(1);
  spinShow.value = false;
  if (Num <= Math.ceil(Math.random() * 100)) {
    loadingBar.error();
  } else {
    loadingBar.finish();
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
    fullMap.value.set('Link', { ...fullMap.value.get('Link')!, on: true });
    if (!route.query.open) message.success(`Link to '${searchText.value}'`);
    return;
  }
  if (urlMatch.test(searchText.value)) {
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
  for (let [key] of fullMap.value) {
    fullMap.value.set(key, { ...fullMap.value.get(key)!, en: key === search_type.value });
  }
  initLaod();
}

/**
* 更新浏览器 URL 参数（params.type）
*/
async function makeUrl() {
  router.push({
    name: 'Home',
    params: { type: search_type.value },
    query: route.query,
    hash: route.hash
  });
}

/**
* 根据路由参数恢复搜索状态
*/
function checkUrl(): void {
  const type: string = route.params.type as string;
  let test = (): boolean => {
    let reg = new RegExp(`${typeArr.value}`)
    return reg.test(type)
  }
  if (type && !test()) message.error(`No Type: ${type}`), search_type.value = "duckduckgo";
  search_type.value = type;
  const { open, q } = route.query;
  if (q) {
    searchText.value = String(q);
  }
  if (open) {
    nextTick(() => searchfin());
  }
}

/**
* 退出链接预览模式
*/
function exitLinkPreview() {
  fullMap.value.set('Link', { ...fullMap.value.get('Link')!, on: false });
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
  }
}

// ============================================================
// 生命周期 & 监听器
// ============================================================

onMounted(async () => {
  init();
  await yiyan();
  await sleep(1500);
  heltoyi.value = true;
});

// 搜索类型变化 -> 更新引擎状态 + 同步 URL
watch(search_type, () => {
  search_change();
  makeUrl();
}, { immediate: true, deep: true });

// 搜索文本变化 -> 同步到 URL query
watch(searchText, () => {
  router.replace({
    params: { type: search_type.value },
    query: { ...route.query, q: searchText.value }
  });
});
</script>
