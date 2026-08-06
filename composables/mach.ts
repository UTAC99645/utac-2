// ============================================================
// 引擎名集合生成器
// 合并 searchWay.json（主引擎）与 searchKey.json（扩展功能项），
// 导出以 "|" 拼接的引擎名正则片段（computed ref），
// 形如 "google|bing|duckduckgo|Link|QR"。
// 消费方：pages/index.vue 的 checkUrl() 用它校验 URL query 中的
//         type 参数是否为已配置的引擎名（不合法时回退默认引擎）
// 注意：导出的是 computed ref，使用时需取 .value
// 导入方式：命名导出 searchEngineTypes 由 composables/auto.mach.ts
//           模块通过 addImports 注册为全局自动导入，页面中可直接
//           使用（无需手动 import）；default 导出保留为兼容出口
// ============================================================

import type { EngineConfig } from "./type";

// ---------- 搜索引擎配置数据 ----------
import typeMap_Rsrc from "../addition/searchWay.json"; // 主引擎列表
import keyMap_Rsrc from "../addition/searchKey.json";  // 扩展功能项（如 QR）

const typeMap_src = typeMap_Rsrc as [string, EngineConfig][]
const keyMap_src = keyMap_Rsrc as [string, EngineConfig][]

// ============================================================
// 路由动态参数构建
// 取所有配置项的 key（引擎名），用 "|" 拼接成正则分支，
// 结果例："google|bing|duckduckgo|Link|QR"
// ============================================================

const fullMap_src = ref<[string, EngineConfig][]>([...typeMap_src, ...keyMap_src]);

/**
 * 全部引擎名的正则片段（以 "|" 拼接的 computed ref）
 * @returns 形如 "google|bing|duckduckgo|Link|QR" 的字符串，供校验 URL type 参数用
 * @note 返回的是 computed ref，消费方需取 .value
 */
export const searchEngineTypes = computed<string>(() => {
  let rs: string
  let key: any[] = fullMap_src.value.map(item => item[0])
  rs = key.join("|");
  return rs;
});

export default searchEngineTypes
