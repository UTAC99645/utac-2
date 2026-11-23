// ============================================================
// 通用小工具（Nuxt 自动导入 utils/ 下的命名导出）
// ============================================================

/**
 * 毫秒级延时（配合 async/await 使用）
 * @param ms 等待毫秒数
 * @returns 等待完成后 resolve 的 Promise
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
