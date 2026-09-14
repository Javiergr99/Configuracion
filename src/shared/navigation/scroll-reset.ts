/**
 * Política global de desplazamiento del Ecosistema Integral DGCP.
 *
 * Reglas:
 * - toda navegación interna inicia en la parte superior;
 * - Atrás/Adelante inicia arriba;
 * - BFCache no conserva la posición vertical anterior;
 * - también se reinician contenedores principales con overflow.
 */

declare global {
  interface Window {
    __DGCP_SCROLL_RESET_INSTALLED__?: boolean;
  }
}

const APP_SCROLL_SELECTORS = [
  "[data-scroll-restoration-root]",
  "main",
  '[role="main"]',
  "#root",
  ".overflow-y-auto",
  ".overflow-auto",
].join(",");

function isRelevantScrollableElement(element: HTMLElement): boolean {
  if (element.matches('[data-scroll-restoration-root], main, [role="main"], #root')) {
    return true;
  }

  const styles = window.getComputedStyle(element);
  const hasScrollableOverflow =
    styles.overflowY === "auto" || styles.overflowY === "scroll" || styles.overflowY === "overlay";

  if (!hasScrollableOverflow) {
    return false;
  }

  const minimumUsefulHeight = Math.min(320, Math.max(180, window.innerHeight * 0.35));

  return (
    element.clientHeight >= minimumUsefulHeight &&
    (element.scrollHeight > element.clientHeight || element.scrollTop > 0)
  );
}

function resetScrollPosition(): void {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  document.scrollingElement?.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto",
  });

  document.documentElement.scrollTop = 0;
  document.documentElement.scrollLeft = 0;
  document.body.scrollTop = 0;
  document.body.scrollLeft = 0;

  document.querySelectorAll<HTMLElement>(APP_SCROLL_SELECTORS).forEach((element) => {
    if (!isRelevantScrollableElement(element)) {
      return;
    }

    element.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  });
}

let scheduledFrame: number | null = null;

function scheduleScrollReset(): void {
  if (scheduledFrame !== null) {
    window.cancelAnimationFrame(scheduledFrame);
  }

  resetScrollPosition();

  scheduledFrame = window.requestAnimationFrame(() => {
    resetScrollPosition();

    scheduledFrame = window.requestAnimationFrame(() => {
      resetScrollPosition();
      scheduledFrame = null;
    });
  });
}

function installGlobalScrollReset(): void {
  if (window.__DGCP_SCROLL_RESET_INSTALLED__) {
    return;
  }

  window.__DGCP_SCROLL_RESET_INSTALLED__ = true;

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = ((...args: Parameters<History["pushState"]>) => {
    const previousUrl = window.location.href;
    originalPushState(...args);

    if (window.location.href !== previousUrl) {
      scheduleScrollReset();
    }
  }) as History["pushState"];

  window.history.replaceState = ((...args: Parameters<History["replaceState"]>) => {
    const previousUrl = window.location.href;
    originalReplaceState(...args);

    if (window.location.href !== previousUrl) {
      scheduleScrollReset();
    }
  }) as History["replaceState"];

  window.addEventListener("popstate", scheduleScrollReset);
  window.addEventListener("pageshow", scheduleScrollReset);
  window.addEventListener("hashchange", scheduleScrollReset);

  scheduleScrollReset();
}

installGlobalScrollReset();

export {};
