// composables/pointerTrail.ts
// 全站指针轨迹特效：桌面鼠标光点拖尾 / 手机触摸涟漪
// Nuxt 自动导入；在 app.vue 的 onMounted 调用 usePointerTrail().start()

const MAX_PARTICLES = 20;
const SPAWN_INTERVAL_MS = 24;

export function usePointerTrail() {
  let container: HTMLDivElement | null = null;
  let active = 0;
  let lastSpawn = 0;
  let started = false;

  const reduceMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ensureLayer(): HTMLDivElement {
    if (!container) {
      container = document.createElement("div");
      container.className = "trail-layer";
      document.body.appendChild(container);
    }
    return container;
  }

  function spawn(x: number, y: number, isTouch: boolean) {
    if (!container || active >= MAX_PARTICLES) return;
    const el = document.createElement("span");
    el.className = isTouch ? "trail-ripple" : "trail-dot";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    container.appendChild(el);
    active++;
    const done = () => {
      el.removeEventListener("animationend", done);
      el.remove();
      active--;
    };
    el.addEventListener("animationend", done);
  }

  function onMouseMove(e: MouseEvent) {
    const now = performance.now();
    if (now - lastSpawn < SPAWN_INTERVAL_MS) return;
    lastSpawn = now;
    spawn(e.clientX, e.clientY, false);
  }

  function onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    if (t) spawn(t.clientX, t.clientY, true);
  }

  function onTouchMove(e: TouchEvent) {
    const t = e.touches[0];
    if (t) spawn(t.clientX, t.clientY, true);
  }

  function start() {
    if (started) return;
    if (reduceMotion()) return;
    ensureLayer();
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    started = true;
  }

  function stop() {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    if (container) {
      container.innerHTML = "";
      container.remove();
      container = null;
    }
    started = false;
    active = 0;
  }

  return {
    start,
    stop,
    get enabled() {
      return started;
    }
  };
}
