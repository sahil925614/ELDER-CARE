import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

export function WebsiteSmoothScroll() {
  const { key, hash } = useLocation();

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let instance: Lenis | null = null;

    const syncLock = () => {
      if (!instance) return;
      const locked = document.body.style.overflow === "hidden"
        || Boolean(document.querySelector("dialog[open]"));
      if (locked) instance.stop();
      else instance.start();
    };

    const configure = () => {
      instance?.destroy();
      instance = null;
      if (preference.matches) return;
      instance = new Lenis({
        autoRaf: true,
        duration: 0.85,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        smoothWheel: true,
        syncTouch: false,
        anchors: true,
        allowNestedScroll: false,
        prevent: (node) => node.matches(
          'dialog, #mobile-navigation, [aria-label="Additional care services"]',
        ),
      });
      syncLock();
    };

    const scrollToTop = (event: Event) => {
      if (!instance) return;
      event.preventDefault();
      instance.scrollTo(0);
    };
    window.addEventListener("website:scroll-to-top", scrollToTop);
    configure();
    preference.addEventListener("change", configure);
    const bodyObserver = new MutationObserver(syncLock);
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    const dialogObserver = new MutationObserver((records) => {
      const dialogChanged = records.some((record) =>
        record.type === "attributes" ||
        [...record.addedNodes, ...record.removedNodes].some((node) =>
          node instanceof Element && (node.matches("dialog") || Boolean(node.querySelector("dialog"))),
        ),
      );
      if (dialogChanged) syncLock();
    });
    dialogObserver.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"], childList: true });

    // ScrollToTop handles route resets; resolve direct fragment URLs after that.
    const frame = window.requestAnimationFrame(() => {
      if (!hash) return;
      let id: string;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target) return;
      if (instance) {
        const offset = -(parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
        instance.scrollTo(target, { immediate: true, offset });
      } else {
        target.scrollIntoView({ behavior: "instant" });
      }
    });

    return () => {
      window.removeEventListener("website:scroll-to-top", scrollToTop);
      window.cancelAnimationFrame(frame);
      preference.removeEventListener("change", configure);
      bodyObserver.disconnect();
      dialogObserver.disconnect();
      instance?.destroy();
    };
  }, [key, hash]);

  return null;
}
