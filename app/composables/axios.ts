/**
 * ============================================================
 * Axios 全局拦截器（副作用模块）
 * 职责：
 *   1. 请求发出前，在 config.metadata 中记录起始时间戳（保留已有 metadata）
 *   2. 响应返回后，用当前时间减去起始时间戳，把本次请求耗时（ms）写入 res.delay
 * 读取方式：业务代码通过响应对象上的 res.delay 获取请求耗时
 *
 * 注意：本模块没有任何导出，属于纯副作用模块 ——
 *       拦截器只有在模块被 import 时才会注册生效。
 *       当前项目尚无任何文件引入本模块（拦截器暂未启用），
 *       如需生效，应在入口处（如 Nuxt plugin）显式 import 一次。
 * ============================================================
 */

import axios from "axios"

// ---------- 请求拦截器 ----------
// 发出前在 config.metadata 中记录起始时间戳（保留已有 metadata，避免覆盖其他字段）
axios.interceptors.request.use((config: any) => {
  config.metadata = { ...(config.metadata ?? {}), start: Date.now() };
  return config;
});

// ---------- 响应拦截器 ----------
// 返回后用当前时间减去起始时间戳，得到本次请求耗时
axios.interceptors.response.use((res: any) => {
  res.delay = Date.now() - res.config.metadata.start;
  return res;
});
