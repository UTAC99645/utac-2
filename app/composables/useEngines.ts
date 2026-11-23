// ============================================================
// 引擎状态仓（单一数据源）
// 职责：
//   1. 启动时解析 + 校验 addition/*.json 引擎配置（带运行时校验，
//      非法条目跳过并告警，不再依赖 `!` 非空断言）
//   2. 持有全局唯一的「当前激活引擎」与「链接预览开关」状态
//      （原先分散在 search_type_cache 与 fullMap 的 en/on 字段中，
//       现统一收敛到本模块，杜绝双重数据源）
//   3. 派生下拉选项 / 快捷按钮 / URL 校验等只读视图
// 说明：
//   - JSON 条目仍是 [名称, 配置] 二元组数组；历史字段 en/on 会被
//     忽略（向后兼容），激活态只由 active 状态决定
//   - 引擎配置表在模块层构建，内容静态只读，SSR 多请求共享安全；
//     可变状态通过 useState 挂载，保证每请求隔离
// ============================================================

import type { EngineConfig } from "./type";
import searchWay from "../addition/searchWay.json";
import searchKey from "../addition/searchKey.json";

/** 默认引擎（URL 无 type / type 非法时的回退项） */
export const DEFAULT_ENGINE = "duckduckgo";
/** 链接预览伪引擎名（选中时进入内嵌文件预览） */
export const LINK_ENGINE = "Link";
/** QR 码生成伪引擎名（选中时进入二维码面板） */
export const QR_ENGINE = "QR";

/**
 * 解析并校验一份引擎配置（[名称, 配置] 二元组数组）
 * 非法条目跳过并 console.warn，保证坏配置不会让页面崩掉
 * @param raw JSON 导入的原始数据
 * @param source 数据源文件名（仅用于告警信息）
 * @returns 校验通过的二元组数组
 */
function loadEntries(raw: unknown, source: string): [string, EngineConfig][] {
  const out: [string, EngineConfig][] = [];
  if (!Array.isArray(raw)) {
    console.warn(`[engines] ${source} 不是数组，已忽略`);
    return out;
  }
  for (const entry of raw) {
    if (!Array.isArray(entry) || entry.length < 2) {
      console.warn(`[engines] ${source} 存在非法条目（非二元组），已跳过:`, entry);
      continue;
    }
    const [name, cfg] = entry;
    if (typeof name !== "string" || !name || typeof cfg !== "object" || cfg === null || typeof (cfg as EngineConfig).url !== "string") {
      console.warn(`[engines] ${source} 存在非法条目（缺名称或 url），已跳过:`, entry);
      continue;
    }
    out.push([name, { url: (cfg as EngineConfig).url, en: false }]);
  }
  return out;
}

// ---------- 静态只读配置表（模块级，SSR 安全） ----------
const mainEntries = loadEntries(searchWay, "searchWay.json");
const extraEntries = loadEntries(searchKey, "searchKey.json");

/** 全量引擎二元组（主引擎 + 扩展项） */
const engineEntries: [string, EngineConfig][] = [...mainEntries, ...extraEntries];
/** 引擎名 -> 配置 查找表 */
const engineTable = new Map<string, EngineConfig>(engineEntries);

/** 可变的引擎运行状态（每请求隔离） */
interface EnginesState {
  /** 当前激活引擎名 */
  active: string;
  /** Link 引擎的链接预览开关（原先存于 JSON 的 on 字段） */
  previewOn: boolean;
}

/**
 * 引擎状态仓：在任意组件 setup 中调用，返回响应式视图与操作方法
 * @returns 引擎状态视图（返回值为 ref/computed，模板使用前需解构）
 */
export function useEngines() {
  const state = useState<EnginesState>("utac:engines", () => ({
    active: DEFAULT_ENGINE,
    previewOn: false
  }));

  // ---------- 可写计算属性：激活引擎 / 预览开关 ----------
  const active = computed<string>({
    get: () => state.value.active,
    set: (v) => {
      state.value.active = v;
    }
  });
  const previewOn = computed<boolean>({
    get: () => state.value.previewOn,
    set: (v) => {
      state.value.previewOn = v;
    }
  });

  // ---------- 派生只读视图 ----------
  const isQrMode = computed<boolean>(() => state.value.active === QR_ENGINE);
  const isLinkMode = computed<boolean>(() => state.value.active === LINK_ENGINE);
  const entries = computed<[string, EngineConfig][]>(() => engineEntries);
  const engineNames = computed<string[]>(() => [...engineTable.keys()]);
  const engineOptions = computed<{ value: string; label: string }[]>(() =>
    engineNames.value.map((key) => ({ value: key, label: key }))
  );
  /** 快捷切换按钮（searchKey.json 扩展项） */
  const shortcutKeys = computed<string[]>(() => extraEntries.map(([key]) => key));

  // ---------- 操作方法 ----------
  /** 名称是否为已配置引擎（用于校验 URL type 参数） */
  function isValidEngine(name: string): boolean {
    return engineTable.has(name);
  }
  /** 取引擎搜索前缀（未配置返回空串） */
  function urlOf(name: string): string {
    return engineTable.get(name)?.url ?? "";
  }
  /** 切换激活引擎（仅接受已配置项，非法值静默忽略） */
  function activate(name: string): void {
    if (engineTable.has(name)) state.value.active = name;
  }
  /** 回退到默认引擎 */
  function resetToDefault(): void {
    state.value.active = DEFAULT_ENGINE;
  }

  return {
    active,
    previewOn,
    isQrMode,
    isLinkMode,
    entries,
    engineNames,
    engineOptions,
    shortcutKeys,
    isValidEngine,
    urlOf,
    activate,
    resetToDefault
  };
}
