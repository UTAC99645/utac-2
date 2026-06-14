
export interface EngineConfig {
  en: boolean,
  url: string,
  on?: boolean,
  icon?: string
}
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
