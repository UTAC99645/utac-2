// ============================================================
// QR 码生成组合式函数
// 职责：
//   1. 维护纠错等级（L/M/Q/H）
//   2. 拼接二维码内容 = 额外前缀 + 主体 + Link 后缀
//   3. 从 n-qr-code 的 canvas 导出 PNG 下载
// ============================================================

/** QR 纠错等级选项 */
export const QR_LEVELS: { value: string; label: string }[] = [
  { value: "L", label: "L" },
  { value: "M", label: "M" },
  { value: "Q", label: "Q" },
  { value: "H", label: "H" }
];

/** QR 分享后缀：扫码打开后直接进入链接预览 */
const LINK_SUFFIX = "&type=Link&open=true";

/**
 * QR 码状态与操作
 * @param content 主体内容（ref，通常为搜索输入框内容）
 * @returns 纠错等级 / 最终二维码内容 / 开关状态 / 下载方法
 */
export function useQrCode(content: Ref<string>) {
  // 引擎前缀来自引擎状态仓的 urlOf（单一数据源）
  const { urlOf: engineUrlOf } = useEngines();

  /** 当前纠错等级 */
  const level = ref<string>("L");
  /** 额外前缀开关（拼上所选引擎的 url） */
  const prefixOn = ref<boolean>(false);
  /** Link 后缀开关（仅前缀为 Link 时有效） */
  const suffixOn = ref<boolean>(false);
  /** 额外前缀所选引擎名（初值与任何引擎 key 都不匹配，相当于未选中） */
  const prefixEngine = ref<string>("DuckDuckGo");

  /** 额外前缀片段 */
  const prefix = computed<string>(() =>
    prefixOn.value ? engineUrlOf(prefixEngine.value) : ""
  );

  /** Link 后缀片段（需同时满足：前缀开启 + 所选引擎为 Link + 后缀开关开启） */
  const suffix = computed<string>(() =>
    prefixOn.value && prefixEngine.value === "Link" && suffixOn.value ? LINK_SUFFIX : ""
  );

  /** 最终二维码内容：额外前缀 + 主体 + Link 后缀 */
  const value = computed<string>(() => `${prefix.value}${content.value}${suffix.value}`);

  /**
   * 下载当前二维码为 PNG
   * 取 n-qr-code 内部 canvas 导出，找不到 canvas 时静默跳过
   */
  function download(): void {
    const canvas = document.querySelector("#qrcode")?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return {
    level,
    prefixOn,
    suffixOn,
    prefixEngine,
    value,
    download
  };
}
