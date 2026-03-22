axios.interceptors.response.use(res => {
  res.delay = Date.now() - res.config.metadata.start
  return res
})

axios.interceptors.request.use(config => {
  config.metadata = { start: Date.now() }
  return config
})
