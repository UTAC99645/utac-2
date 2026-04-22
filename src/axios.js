/**
 * Axios 拦截器配置
 * 用于计算每个请求的响应延迟时间
 */

// 响应拦截器：计算请求耗时
axios.interceptors.response.use(res => {
  res.delay = Date.now() - res.config.metadata.start
  return res
})

// 请求拦截器：记录请求开始时间
axios.interceptors.request.use(config => {
  config.metadata = { start: Date.now() }
  return config
})
