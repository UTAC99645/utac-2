/**
 * ============================================================
 * Axios 拦截器配置
 * 职责：为每个请求自动计算并记录响应延迟（ms）
 * 使用方式：响应对象中可通过 res.delay 读取耗时
 * ============================================================
 */

// ---------- 响应拦截器 ----------
// 在请求返回后，用当前时间减去请求开始时记录的时间戳，得到延迟
axios.interceptors.response.use(res => {
  res.delay = Date.now() - res.config.metadata.start;
  return res;
});

// ---------- 请求拦截器 ----------
// 在请求发出前，在 config.metadata 中记录当前时间戳
axios.interceptors.request.use(config => {
  config.metadata = { start: Date.now() };
  return config;
});
