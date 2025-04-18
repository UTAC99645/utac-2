// ==UserScript==
// @name         网页控制台喵!
// @namespace    http://utac.top/
// @version      1.4
// @description  使用腾讯vConsole在任意网页注入移动端调试控制台
// @author       UTAC
// @match        *://*/*
// @grant        none
// @run-at       document-start
// @updateURL    https://file.utac.top/js/VC.js
// @downloadURL  https://file.utac.top/js/VC.js
// ==/UserScript==

(function () {
  "use strict";

  // 如果已经存在就不再初始化喵～（单例模式）
  if (window.vConsole) {
    console.log("[Via控制台] vConsole 已经在运行了呢喵～");
    return;
  }

  // 备用 CDN 列表，一个挂了自动换下一个喵～
  const cdns = [
    "https://unpkg.com/vconsole@latest/dist/vconsole.min.js",
    "https://cdn.jsdelivr.net/npm/vconsole@latest/dist/vconsole.min.js",
    "https://cdn.bootcdn.net/ajax/libs/vConsole/3.15.1/vconsole.min.js",
  ];

  let cdnIndex = 0;

  function loadVConsole() {
    if (cdnIndex >= cdns.length) {
      console.error("[Via控制台] 所有 CDN 都加载失败了喵... 请检查网络连接");
      return;
    }

    const script = document.createElement("script");
    script.src = cdns[cdnIndex];

    script.onload = function () {
      if (typeof window.VConsole === "undefined") {
        console.error(
          "[Via控制台] CDN " + (cdnIndex + 1) + " 加载了但没有 VConsole 对象喵，换下一个试试...",
        );
        cdnIndex++;
        loadVConsole();
        return;
      }

      try {
        window.vConsole = new window.VConsole({
          defaultPlugins: ["system", "network", "element", "storage"],
          maxLogNumber: 5000,
          theme: "dark",
        });
        console.log("[Via控制台] vConsole 初始化成功喵～点击右下角按钮使用！");
      } catch (err) {
        console.error("[Via控制台] vConsole 初始化出错喵:", err);
      }
    };

    script.onerror = function () {
      console.error(
        "[Via控制台] CDN " + (cdnIndex + 1) + " (" + cdns[cdnIndex] + ") 加载失败喵，尝试备用源...",
      );
      cdnIndex++;
      loadVConsole();
    };

    (document.head || document.documentElement).appendChild(script);
  }

  loadVConsole();
})();
