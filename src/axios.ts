/**
 * ============================================================
 * Axios 全局拦截器
 * 职责：为每个请求自动统计耗时（ms）
 * 读取方式：响应对象上的 res.delay（由 main.ts 副作用引入后全局生效）
 * ============================================================
 */

import axios from "axios"

// ---------- 请求拦截器 ----------
// 发出前在 config.metadata 中记录起始时间戳（保留已有 metadata）
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
