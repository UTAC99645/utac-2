// ============================================================
// 全局 TypeScript 类型定义
// ============================================================

/**
 * 搜索引擎 / 功能项配置
 * 数据来源：addition/searchWay.json（主引擎）、searchKey.json（扩展功能项）
 * 字段：
 *   en   —— 是否为当前激活项（同一时刻通常只有一个为 true）
 *   url  —— 搜索前缀，搜索时与用户输入拼接后打开
 *   on   —— 仅 Link 引擎使用：是否进入内嵌预览模式
 *   icon —— 引擎图标路径（预留字段）
 */
export interface EngineConfig {
  en: boolean,
  url: string,
  on?: boolean,
  icon?: string
}

/**
 * 一言（Hitokoto）API 返回条目
 * 接口：https://v1.hitokoto.cn
 * 必填：hitokoto（句子）、from（出处）、from_who（作者，可为 null）
 * 其余字段可选
 */
export interface YiyanItem {
  hitokoto: string
  from: string
  from_who: string | null
  // 以下可选
  id?: number
  uuid?: string
  type?: string
  creator?: string
  creator_uid?: number
  reviewer?: number
  commit_from?: string
  created_at?: string
  length?: number
}
