// ============================================================
// 首页数据编排组合式函数
// 职责：把 useYiyan 的拉取流程包装成页面可直接调用的形式，
//       并派生「当前一言句子」等只读视图
// ============================================================

/**
 * 首页数据（当前仅一言）
 * @returns 一言状态仓 + 拉取方法（可注入失败回调）
 */
export function useHomePageData() {
  const yiyan = useYiyan();

  /**
   * 拉取一言（含失败提示注入与重试，重试上限见 useYiyan）
   * @param onError 失败提示回调（如 message.error）
   */
  async function fetchYiyan(onError?: (err: unknown) => void): Promise<void> {
    if (onError) yiyan.setErrorHandler(onError);
    await yiyan.fetchOne();
  }

  /** 当前一言句子（列表第一条；无则空串） */
  const word = computed<string>(() => yiyan.list.value[0]?.hitokoto ?? "");

  return {
    yiyan,
    fetchYiyan,
    yiyan_word: word,
    word
  };
}
