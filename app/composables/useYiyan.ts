// ============================================================
// 一言（Hitokoto）组合式函数
// 数据源：https://v1.hitokoto.cn
// 职责：
//   1. 拉取一言并维护当前句子
//   2. 失败自动重试（上限 3 次，修复原版无限递归重试问题）
//   3. 2s 冷却锁防连点
// ============================================================

const HITOKOTO_API = "https://v1.hitokoto.cn";
/** 请求失败最大重试次数 */
const MAX_RETRIES = 3;
/** 按钮冷却时长（毫秒） */
const COOLDOWN_MS = 2000;

/**
 * 一言状态与操作
 * @returns 一言句子 / 刷新方法 / 冷却锁状态
 */
export function useYiyan() {
  const list = ref<YiyanItem[]>([
    { hitokoto: "加载中喵~", from: "", from_who: "" }
  ]);
  const loading = ref<boolean>(false);
  /** 失败提示回调（由页面注入 useMessage，保持本模块无 UI 依赖） */
  let onError: ((err: unknown) => void) | null = null;

  /**
   * 注入失败提示回调（如 message.error）
   * @param cb 失败回调
   */
  function setErrorHandler(cb: (err: unknown) => void): void {
    onError = cb;
  }

  /**
   * 拉取一条新一言替换当前句子
   * @param retries 剩余重试次数（内部递归用，外部无需传）
   */
  async function fetchOne(retries: number = MAX_RETRIES): Promise<void> {
    if (loading.value) return;
    loading.value = true;
    let next: YiyanItem | null = null;
    try {
      const res = await fetch(HITOKOTO_API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      next = (await res.json()) as YiyanItem;
    } catch (err) {
      if (onError) onError(err);
    } finally {
      loading.value = false;
    }
    if (next) {
      list.value = [next];
      return;
    }
    if (retries > 0) {
      await sleep(COOLDOWN_MS);
      await fetchOne(retries - 1);
    }
  }

  return {
    list,
    loading,
    setErrorHandler,
    fetchOne
  };
}
