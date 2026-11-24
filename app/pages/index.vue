<template>
  <!-- ========================================================== -->
  <!-- 首页组件（编排层）
       功能：
       1. 多引擎搜索（引擎配置见 composables/useEngines.ts）
       2. QR 码生成（components/SearchQrPanel.vue）
       3. 链接预览（components/FileViewer.vue）
       4. 一言展示（components/HitokotoCard.vue + useYiyan）
       URL 设计：/?type=xxx&q=xxx&open=true 双向同步（见 useSearchUrl）
  -->
  <!-- ========================================================== -->

  <!-- ---------- 启动屏：纯 CSS 品牌动画（零下载，SSR 直出） ---------- -->
  <div v-if="booting" class="boot-screen" :class="{ 'boot-out': bootOut }">
    <div class="boot-brand">UTAC</div>
    <div class="boot-bar"><span></span></div>
  </div>

  <!-- ---------- 主内容 ----------
       搜索 UI 含 naive-ui Select / vueuc Follower（依赖浏览器 DOM 测量），
       必须客户端挂载，否则 SSR 报 document is not defined（500）；
       服务端只直出上面的启动屏，水合后本节点才渲染 -->
  <ClientOnly>
    <div class="home-page">
    <!-- ==================== 搜索页 ==================== -->
    <div v-if="!engines.previewOn.value">
      <title type="info">UTAC'S Search</title>
      <h1 class="title">{{ Hello }}</h1>

      <!-- 搜索输入区（引擎下拉 + 关键词输入；QR 模式为多行文本域） -->
      <div v-if="!engines.isQrMode.value">
        <form @submit.prevent="searchfin">
          <n-input-group>
            <n-select v-model:value="engines.active.value" :options="engines.engineOptions.value" size="large" />
            <n-input v-model:value="searchText" clearable size="large" />
          </n-input-group>
        </form>
      </div>
      <div v-else>
        <n-input round :type="inputtype" clearable size="large" v-model:value="searchText"
          id="Search" placeholder="context" />
      </div>

      <n-divider />

      <!-- 引擎快捷切换按钮（searchKey.json 扩展项；再点当前项回默认引擎） -->
      <n-flex justify="space-around">
        <div class="typekey" v-for="key in engines.shortcutKeys.value" :key="key">
          <n-button :dashed="!(engines.active.value === key)" ghost type="error" size="large" @click="toggleShortcut(key)">
            {{ key === engines.active.value ? "Back" : key }}
          </n-button>
        </div>
      </n-flex>

      <n-divider />

      <div class="page">
        <!-- ==================== QR 码面板 ==================== -->
        <SearchQrPanel v-if="engines.isQrMode.value" :content="searchText" />

        <!-- ==================== 一言卡片 ==================== -->
        <div v-if="yiyan.list.value.length">
          <template v-for="(value, index) in yiyan.list.value" :key="index">
            <HitokotoCard :item="value" :loading="yiyan.loading.value" @refresh="refreshYiyan" />
            <n-divider v-if="index + 1 !== yiyan.list.value.length" />
          </template>
        </div>
      </div>
    </div>

    <!-- ==================== 链接预览模式（Link 引擎预览态替换搜索页） ==================== -->
    <div v-else>
      <FileViewer :url="searchText" @back="engines.previewOn.value = false" />
    </div>
  </div>
  </ClientOnly>
</template>

<script setup lang="ts">
// ============================================================
// 首页脚本（编排层）
// 状态与逻辑来源：
//   useEngines  —— 引擎单一数据源（composables/useEngines.ts）
//   useYiyan    —— 一言拉取 / 重试 / 冷却（composables/useYiyan.ts）
//   useSearchUrl —— URL query 双向同步（composables/useSearchUrl.ts）
// ============================================================

// ---------- 页面样式 ----------
import "../assets/css/home.css";

// ---------- 链接预览器：异步加载（避免首屏拉入 marked / highlight.js） ----------
const FileViewer = defineAsyncComponent(() => import("~/components/FileViewer.vue"));

// ============================================================
// 状态仓
// ============================================================

const engines = useEngines();
const { fetchYiyan, yiyan, word: yiyanWord } = useHomePageData();

// ============================================================
// 响应式数据
// ============================================================

const searchText = ref<string>(""); // 输入框内容
/** 启动屏显隐（纯 CSS 动画，约 900ms 后退场） */
const booting = ref(true);
const bootOut = ref(false);
/** 页面标题控制（false 显示固定标题，true 显示一言） */
const heltoyi = ref(false);

/** 粗略判断输入是否为 http(s) URL */
const urlMatch: RegExp = /^https?:\/\/.+\..+/i;

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

/** 页面标题（挂载 1.5s 后由固定标题切换为一言） */
const Hello = computed<string>(() => (heltoyi.value ? yiyanWord.value : "UTAC's search"));

/** 输入框类型（QR 模式用多行文本域） */
const inputtype = computed<"text" | "textarea">(() =>
  engines.isQrMode.value ? "textarea" : "text"
);

/** 启动屏：播放约 750ms 后触发退场动画，动画结束彻底移除 */
async function runBoot(): Promise<void> {
  loadingBar.start();
  await sleep(750);
  bootOut.value = true;
  await sleep(280);
  booting.value = false;
  loadingBar.finish();
}

/** 搜索链接拼接（QR 模式下内容即原文，不再拼接前缀） */
const searchLC = computed<string>(() => {
  if (engines.active.value === "QR") {
    return searchText.value;
  }
  return `${engines.urlOf(engines.active.value)}${searchText.value}`;
});

// ============================================================
// 方法
// ============================================================

/** 刷新一言（挂载时也调用；冷却锁在 useYiyan 内部） */
async function refreshYiyan(): Promise<void> {
  loadingBar.start();
  await fetchYiyan((err) => message.error(`Get yiyan error with: ${err}`));
  loadingBar.finish();
}

/**
 * 搜索提交
 *   1. 空输入     -> 提示并返回
 *   2. Link 模式  -> 进入内嵌预览
 *   3. 输入是 URL -> 新标签直接打开
 *   4. 普通搜索词 -> 拼接引擎前缀后新标签打开
 */
function searchfin(): void {
  if (!searchText.value.trim()) {
    message.warning("Nothing to search");
    return;
  }
  if (engines.isLinkMode.value) {
    engines.previewOn.value = true;
    if (!route.query.open) message.success(`Link to '${searchText.value}'`);
    return;
  }
  if (urlMatch.test(searchText.value)) {
    window.open(searchText.value);
  } else {
    window.open(searchLC.value, "_blank");
  }
}

/**
 * 快捷切换按钮：点击扩展项切换引擎；再点当前项回默认引擎
 * @param key 扩展项名
 */
function toggleShortcut(key: string): void {
  if (key === engines.active.value) {
    engines.resetToDefault();
  } else {
    engines.activate(key);
  }
}

/**
 * 根据 URL query 恢复搜索状态（分享链接打开时执行）
 *   1. 引擎名不在配置中时提示错误并回退默认引擎
 *   2. 规范化 open 参数（true/t/false/f，其他按真值）并回写 URL
 *   3. q 参数填入输入框；open 为真时下一拍自动搜索
 */
function checkUrl(): void {
  const type = String(route.query.type ?? "");
  if (type && !engines.isValidEngine(type)) {
    message.error(`No Type: ${type}`);
    engines.resetToDefault();
  } else if (type) {
    engines.activate(type);
  }

  const raw = route.query.open as string | undefined;
  let open = false;
  if (raw === "true" || raw === "t") open = true;
  else if (raw === "false" || raw === "f") open = false;
  else open = !!raw;

  const query = route.query.q;
  router.replace({
    path: "/",
    query: { ...route.query, type: engines.active.value, q: String(query ?? ""), open: String(open) },
    hash: route.hash
  });

  if (query) searchText.value = String(query);
  if (open) nextTick(() => searchfin());
}

/** 初始化：播放启动屏；URL 带引擎参数时恢复状态 */
function init(): void {
  runBoot();
  if (route.query.type) checkUrl();
}

// ============================================================
// 生命周期 & 监听器
// ============================================================

// 引擎变化 -> 播放切换动效 + 回写 URL（immediate 保证挂载先执行一次）
watch(
  () => engines.active.value,
  () => {
    router.push({
      path: "/",
      query: { ...route.query, type: engines.active.value },
      hash: route.hash
    });
  },
  { immediate: true }
);

// 输入变化 -> 同步进 URL query（搜索链接即可分享）
watch(searchText, () => {
  router.replace({
    path: "/",
    query: { ...route.query, type: engines.active.value, q: searchText.value }
  });
});

onMounted(async () => {
  init();
  await refreshYiyan();
  await sleep(1500);
  heltoyi.value = true; // 1.5s 后页面标题切换为一言

  useSeoMeta({
    title: () => engines.isQrMode.value ? "QR Maker" : `Search With ${engines.active.value}`,
  });
});
</script>
