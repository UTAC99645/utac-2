// ============================================================
// 引擎名集合生成器
// 合并 searchWay.json（主引擎）与 searchKey.json（扩展功能项），
// 导出形如 "google|bing|duckduckgo|Link|QR" 的正则片段，
// 供 main.ts 中路由 :type 动态参数做取值约束，
// 也供 home.vue 校验路由传入的引擎名是否合法
// ============================================================

import { EngineConfig } from "@/ts/type";

// ---------- 搜索引擎配置数据 ----------
import typeMap_Rsrc from "./searchWay.json"; // 主引擎列表
import keyMap_Rsrc from "./searchKey.json";  // 扩展功能项（如 QR）

const typeMap_src = typeMap_Rsrc as [string, EngineConfig][]
const keyMap_src = keyMap_Rsrc as [string, EngineConfig][]

// ============================================================
// 路由动态参数构建
// 取所有配置项的 key（引擎名），用 "|" 拼接成正则分支，
// 结果例："google|bing|duckduckgo|Link|QR"
// ============================================================

const fullMap_src = ref<[string, EngineConfig][]>([...typeMap_src, ...keyMap_src]);

const searchEngineTypes = computed<string>(() => {
  let rs: string
  let key: any[] = fullMap_src.value.map(item => item[0])
  rs = key.join("|");
  return rs;
});

export default searchEngineTypes
