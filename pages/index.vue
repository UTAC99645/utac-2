<template>
  <!-- ========================================================== -->
  <!-- 首页组件
       功能：
       1. 多引擎搜索（引擎列表由 JSON 配置动态加载）
       2. QR 码生成与下载（可拼接额外引擎前缀 / Link 后缀）
       3. 链接预览（内嵌文件查看器 Link.vue）
       4. 一言（Hitokoto）随机展示
       URL 设计：引擎与搜索词通过 /?type=xxx&q=xxx 的 query 参数双向同步，
       配合 ?open=true 可实现"打开链接即搜索"的分享效果
  -->
  <!-- ========================================================== -->

  <!-- ---------- 加载动画层（仅闪现约 1ms，配合顶部加载条的随机动效） ---------- -->
  <div class="home-page" v-if="spinShow">
    <n-image :src="lodimg" style="width: 100vw" alt="Loading" />
  </div>

  <!-- ---------- 主内容 ---------- -->
  <div class="home-page" v-else>
    <!-- ==================== 搜索页 ==================== -->
    <div v-if="!onLink">
      <title type="info">UTAC'S Search</title>
      <h1 class="title">{{ Hello }}</h1>

      <!-- 搜索输入区（引擎下拉 + 关键词输入） -->
      <div v-if="!QR">
        <form @submit.prevent="searchfin">
          <n-input-group>
            <n-select v-model:value="search_type" :options="searchkey" size="large" />
            <n-input v-model:value="searchText" clearable size="large" />
          </n-input-group>
        </form>
      </div>

      <!-- QR 模式输入框（多行文本，内容即二维码内容） -->
      <div v-else>
        <n-input round :type="inputtype" :loading="inputLod" clearable size="large" v-model:value="searchText"
          id="Search" placeholder="context" />
      </div>

      <n-divider />

      <!-- 引擎快捷切换按钮（仅列出 searchKey.json 中的扩展项；
           再次点击当前引擎则回到默认 duckduckgo） -->
      <n-flex justify="space-around">
        <div class="typekey" v-for="[key] in keyMap" :key="key">
          <n-button :dashed="!(search_type === key)" ghost type="error" size="large" @click="
            () => {
              if (key === search_type) {
                search_type = 'duckduckgo';
              } else {
                search_type = key;
              }
            }
          ">
            {{ key === search_type ? "Back" : key }}
          </n-button>
        </div>
      </n-flex>

      <n-divider />

      <div class="page">
        <!-- ==================== QR 码区域（QR 引擎激活时显示） ==================== -->
        <n-flex v-show="QR" justify="center" style="margin-top: 20px">
          <!-- 纠错等级选择（L/M/Q/H，纠错能力由低到高） -->
          <div>
            <n-button v-for="item in QRc" :key="item.value" type="error" size="small" @click="
              () => {
                QRck = item.value;
                message.warning(`Set QR code error correction level to ${item.value}`);
              }
            ">
              {{ item.label }}
            </n-button>
          </div>

          <!-- 功能开关行：
               N/U  —— 额外前缀开关（在二维码内容前拼接所选引擎的 url）
               O/NO —— Link 后缀开关（追加 &type=Link&open=true，
                      使扫码打开后直接进入链接预览；仅前缀为 Link 时显示） -->
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

          <!-- 额外前缀的引擎选择（高亮项为当前所选） -->
          <n-flex v-show="extra_on">
            <n-button v-for="[key] in fullMap" :key="key" :type="key === searchLCfqt ? 'primary' : 'default'" @click="
              () => {
                searchLCfqt = key;
              }
            ">
              {{ key }}
            </n-button>
          </n-flex>

          <!-- QR 码本体（value 为最终拼接结果 searchLCfq） -->
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

    <!-- ==================== 链接预览模式（Link 引擎 on=true 时替换搜索页） ==================== -->
    <div v-else>
      <Rader :url="searchText" @back="exitLinkPreview" />
    </div>
  </div>
</template>

<script setup lang="ts">
// ============================================================
// 首页脚本
// ============================================================

// ---------- Vue 核心 API / Vue Router / 类型定义 ----------
// （ref / computed / useRoute 等由 Nuxt 自动导入；
//   EngineConfig / YiyanItem 来自 composables/type.ts，同样由 Nuxt 自动导入）

// ---------- 外部依赖 ----------
import axios from "axios";

// ---------- 页面样式 ----------
import "../assets/css/home.css";

// ---------- 搜索引擎配置（JSON 数据源） ----------
import typeMap_Rsrc from "../addition/searchWay.json";
import keyMap_Rsrc from "../addition/searchKey.json";

// ---------- 引擎名集合（校验路由 type 参数） ----------
// searchEngineTypes 由 composables/auto.mach.ts 模块注入为全局自动导入，
// 无需手动 import（实现见 composables/mach.ts）

// ---------- Link 预览组件（异步加载，避免首屏打包 marked / highlight.js 等大型依赖） ----------
const Rader = defineAsyncComponent(() => import("../components/Link.vue"));

// JSON 条目是 [引擎名, 配置] 二元组，断言后供下方 Map 使用
const typeMap_src = typeMap_Rsrc as [string, EngineConfig][];
const keyMap_src = keyMap_Rsrc as [string, EngineConfig][];

// ============================================================
// 常量 & 工具函数
// ============================================================

// 粗略判断输入是否为 http(s) URL（用于"输入链接直接打开"分支）
const urlMatch: RegExp = /^https?:\/\/.+\..+/i;

// 毫秒级延时（配合 async/await 使用）
const sleep: Function = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// 响应式数据
// ============================================================

// --- 搜索相关 ---
const searchText = ref<string>(""); // 输入框内容
const search_type_cache = ref("duckduckgo"); // 当前引擎（search_type 的底层存储）
// QR 区域"额外前缀"所选引擎
// 注：初值 'DuckDuckGo' 与配置中的小写 key 不匹配，相当于初始未选中
const searchLCfqt = ref("DuckDuckGo");

// --- UI 状态 ---
const spinShow = ref(false); // 加载动画层显隐
const extra_on = ref(false); // QR 额外前缀开关
const extra_1_on = ref(false); // QR Link 后缀开关

// --- 页面标题控制（false 显示固定标题，true 显示一言） ---
const heltoyi = ref(false);

// --- 加载图片映射（随机二选一） ---
const localmap = new Map([
  ["Evil", { url: "/assets/img/lod/Evil.gif" }],
  ["Neuro", { url: "/assets/img/lod/Neuro.gif" }]
]);

// --- 搜索引擎配置映射（由 JSON 初始化） ---
// keyMap  ：扩展功能项（searchKey.json），驱动引擎快捷切换按钮
// fullMap ：全量引擎表（主引擎 + 扩展项），选项、激活态、前缀拼接都基于它
// 配置字段：en 是否激活 / url 搜索前缀 / on Link 是否进入预览 / icon 图标（预留）
const keyMap = ref<Map<string, EngineConfig>>(new Map(keyMap_src));
const fullMap = ref<Map<string, EngineConfig>>(new Map([...typeMap_src, ...keyMap_src]));

// --- QR 码纠错等级选项 ---
const QRc: { value: string; label: string }[] = [
  { value: "L", label: "L" },
  { value: "M", label: "M" },
  { value: "Q", label: "Q" },
  { value: "H", label: "H" }
];
const QRck = ref("L"); // 当前纠错等级

// --- 一言数据（仅展示第 1 条；初始为占位文本） ---
const yiyandata = ref<YiyanItem[]>([
  {
    hitokoto: "加载中喵~",
    from: "",
    from_who: ""
  }
]);

const yiyan_lock_cache = ref<boolean>(false); // 一言按钮冷却锁

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
const QR = computed<boolean>(() => fullMap.value.get("QR")!.en);

// --- 当前是否为 Link 搜索模式 ---
const Link = computed<boolean>(() => fullMap.value.get("Link")!.en);

// --- 是否显示链接预览 ---
const onLink = computed<boolean>(() => fullMap.value.get("Link")!.on ?? false);

// --- 页面标题（挂载 1.5s 后由固定标题切换为一言） ---
const Hello = computed<string>(() => (heltoyi.value ? yiyan_word.value : "UTAC's search"));

// --- 当前一言句子 ---
const yiyan_word = computed<string>(() => yiyandata.value[0]?.hitokoto ?? "");

// --- 引擎下拉选项（由 fullMap 动态生成，供 n-select 使用） ---
const searchkey = computed<{ value: string; label: string }[]>(() =>
  [...fullMap.value.keys()].map((key) => ({ value: key, label: key }))
);

// --- 搜索链接拼接（QR 模式下内容即原文，不再拼接前缀） ---
const searchLC = computed<string>(() => {
  if (search_type.value === "QR") {
    return searchText.value;
  }
  const type = fullMap.value.get(search_type.value)?.url ?? "";
  return `${type}${searchText.value}`;
});

// --- QR 额外前缀（取所选引擎的 url，未开启时为空） ---
const extra = computed<string>(() => {
  if (!extra_on.value) return "";
  return fullMap.value.get(searchLCfqt.value)?.url ?? "";
});

// --- QR Link 后缀（使扫码打开后直接进入链接预览） ---
const extra_1 = computed<string>(() => {
  if (extra_1_on.value && extra_on.value && searchLCfqt.value === "Link") {
    return "&type=Link&open=true";
  }
  return "";
});

// --- 最终二维码内容：额外前缀 + 主体 + Link 后缀 ---
const searchLCfq = computed<string>(() => `${extra.value}${searchLC.value}${extra_1.value}`);

// --- 当前搜索引擎（读写计算属性） ---
// 特殊处理伪引擎 rlyiyan：选中时仅刷新一言，不改变当前引擎（预留入口，JSON 中未配置）
const search_type = computed<string>({
  get() {
    return search_type_cache.value;
  },
  set(value) {
    if (value === "rlyiyan") {
      yiyan();
      return;
    }
    if (value !== search_type_cache.value) {
      search_type_cache.value = value;
      if (!route.query.open) message.info(`By ${value}`);
    }
  }
});

// --- 输入框类型（QR 模式用多行文本域） ---
const inputtype = computed<"text" | "textarea">(() =>
  search_type.value === "QR" ? "textarea" : "text"
);

// --- 输入框加载态（QR 模式不显示） ---
const inputLod = computed<boolean>(() => search_type.value !== "QR");

// --- 随机加载图片 ---
const lodimg = computed<string>(() => localmap.get(Math.random() > 0.5 ? "Evil" : "Neuro")!.url);

// ============================================================
// 方法
// ============================================================

/**
 * 获取一言（Hitokoto）并替换当前展示
 * 流程：请求 -> 冷却 2s（防连点）-> 更新列表
 * 重试机制：x 初值取当前列表第 2 项（通常为 undefined，作为"请求失败"的哨兵值）；
 *           若请求失败 x 保持不变（仍是哨兵），则递归重试直至拿到新数据
 */
async function yiyan(): Promise<void> {
  yiyan_lock_cache.value = true;
  console.log("start get yiyan");
  loadingBar.start();
  // 类型为 YiyanItem | undefined：undefined 即哨兵值，表示本次请求未拿到新数据
  let x: YiyanItem | undefined = yiyandata.value[1];
  await axios
    .get("https://v1.hitokoto.cn")
    .then((res) => {
      x = res.data;
      console.log(res);
      loadingBar.finish();
    })
    .catch((err) => {
      message.error(`Get yiyan error with: ${err}`);
      loadingBar.error();
    });
  await sleep(2000);
  yiyan_lock_cache.value = false;
  if (x === yiyandata.value[1]) {
    // x 仍是哨兵值 -> 请求失败，递归重试
    await yiyan();
  } else {
    // x 已被响应数据替换（非 undefined）-> 用新数据更新列表
    yiyandata.value = [x as YiyanItem];
  }
}

/**
 * 初始化入口：播放加载动效；URL 带引擎参数时恢复对应搜索状态
 * @returns 无（异步流程，随动效/恢复完成后结束）
 */
async function init() {
  initLaod();
  if (route.query.type) checkUrl();
}

/**
 * 加载动效
 * 加载条起步 + 加载图闪现约 1ms（肉眼基本不可见）；
 * 随后按随机数决定加载条以 error 还是 finish 收尾。
 * @param Num error 收尾的概率百分位（默认 50，约一半概率，彩蛋效果）
 * @returns 无（纯动效副作用）
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
 *   1. 空输入        -> 提示并返回
 *   2. Link 模式     -> 置 on=true，进入内嵌预览
 *   3. 输入是 URL    -> 新标签直接打开
 *   4. 普通搜索词    -> 拼接引擎前缀后新标签打开
 * @returns 无（副作用：打开新窗口 / 切换预览态 / 弹出提示）
 */
function searchfin() {
  if (!searchText.value.trim()) {
    message.warning("Nothing to search");
    return;
  }
  if (Link.value) {
    fullMap.value.set("Link", { ...fullMap.value.get("Link")!, on: true });
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
 * 同步引擎激活状态：fullMap 中仅当前引擎的 en 置 true，其余置 false，
 * 并播放一次加载动效作为切换反馈
 * @returns 无（副作用：更新 fullMap 激活态 + 动效）
 */
async function search_change() {
  loadingBar.start();
  for (let [key] of fullMap.value) {
    fullMap.value.set(key, { ...fullMap.value.get(key)!, en: key === search_type.value });
  }
  initLaod();
}

/**
 * 把当前引擎写入 URL query（保留原有 query/hash），使页面状态可分享
 * @returns 无（副作用：路由 query 更新）
 */
function makeUrl() {
  router.push({
    path: "/",
    query: { ...route.query, type: search_type.value },
    hash: route.hash
  });
}

/**
 * 根据 URL query 恢复搜索状态（分享链接打开时执行）
 *   1. 引擎名不在配置中时弹出错误提示，并回退到默认引擎 duckduckgo
 *   2. 解析 open 查询参数（支持 true / t / false / f，其他值按真值处理），
 *      并把规范化后的 open 回写 URL
 *   3. 将 q 参数（搜索词）填入输入框；open 为真时下一拍自动执行搜索
 * @returns 无（副作用：回写路由 query、填输入框、按需触发搜索）
 */
function checkUrl(): void {
  const type: string = route.query.type as string;
  let test = (): boolean => {
    let reg = new RegExp(`${searchEngineTypes.value}`);
    return reg.test(type);
  };
  if (type && !test()) (message.error(`No Type: ${type}`), (search_type.value = "duckduckgo"));
  search_type.value = type;

  let raw = route.query.open as string;
  console.log(raw);
  let open: boolean = false;
  if (raw === "true" || raw === "t") {
    open = true as boolean;
  } else if (raw === "false" || raw === "f") {
    open = false as boolean;
  } else {
    open = !!raw;
  }
  const query = route.query.q;

  router.replace({
    path: "/",
    query: { ...route.query, type: search_type.value, q: String(query ?? ""), open: String(open) },
    hash: route.hash
  });

  if (query) {
    searchText.value = String(query);
  }
  if (open) {
    nextTick(() => searchfin());
  }
}

/**
 * 退出链接预览模式（置 Link.on=false，回到搜索页）
 * @returns 无（副作用：更新 fullMap 中 Link 的 on 标记）
 */
function exitLinkPreview() {
  fullMap.value.set("Link", { ...fullMap.value.get("Link")!, on: false });
}

/**
 * 下载当前 QR 码：取 n-qr-code 内部 canvas 导出 PNG 并触发浏览器下载
 * @returns 无（副作用：触发 PNG 文件下载；找不到 canvas 时静默跳过）
 */
function QRdownload() {
  const canvas = document.querySelector("#qrcode")?.querySelector("canvas");
  if (canvas) {
    const link = canvas.toDataURL();
    const a = document.createElement("a");
    a.download = "qrcode.png";
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
  heltoyi.value = true; // 1.5s 后页面标题切换为一言
});

// 引擎变化 -> 同步激活态 + 回写 URL（immediate 保证挂载时先执行一次）
watch(
  search_type,
  () => {
    search_change();
    makeUrl();
  },
  { immediate: true, deep: true }
);

// 输入变化 -> 同步进 URL query，实现"搜索链接即可分享"
watch(searchText, () => {
  router.replace({
    path: "/",
    query: { ...route.query, type: search_type.value, q: searchText.value }
  });
});
</script>
