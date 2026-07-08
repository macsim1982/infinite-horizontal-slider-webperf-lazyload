const SELECTOR = ".js-slider-wrapper";
const READY_ATTR = "data-slider-ready";
const HOVER_BOUND_ATTR = "data-hover-bound";

let sliderModulePromise = null;
let observer = null;
let chunkLoaded = false;
let loadedSlidersCount = 0;

export function isDesktop() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function updateLoadStatus(total = 0) {
  const status = document.getElementById("js-load-status");

  if (status) {
    const mode = isDesktop() ? "hover" : "viewport";
    status.textContent = chunkLoaded
      ? `Bootstrap chargé (${mode}) — chunk slider : chargé (1 fetch) ${total} slider(s) activé(s)`
      : `Bootstrap chargé (${mode}) — chunk slider : non ${total} slider(s) activé(s)`;
  }
}

function loadSliderModule() {
  if (sliderModulePromise === null) {
    sliderModulePromise = import("./slider.js").then((mod) => {
      chunkLoaded = true;
      // updateLoadStatus(0);
      return mod;
    });
  }

  return sliderModulePromise;
}

async function activateWrapper($wrapper) {
  const canActivate =
    $wrapper &&
    !$wrapper.getAttribute(READY_ATTR) &&
    $wrapper.dataset.slides;

  let slides = null;

  if (canActivate) {
    try {
      slides = JSON.parse($wrapper.dataset.slides);
    } catch {
      slides = null;
    }
  }

  if (slides) {
    const { createSlider, setupDelegation } = await loadSliderModule();

    setupDelegation();
    $wrapper.setAttribute(READY_ATTR, "1");
    createSlider($wrapper, { slides });
    updateLoadStatus(++loadedSlidersCount);
    observer?.unobserve($wrapper);
  }
}

async function activateWrappers(wrappers) {
  await Promise.all(wrappers.map((wrapper) => activateWrapper(wrapper)));
}

function initObserver() {
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.intersectionRatio > 0)
          .map((entry) => entry.target);

        if (visible.length > 0) {
          activateWrappers(visible);
        }
      },
      { rootMargin: "0px", threshold: 0 }
    );

    registerSliders(document);
  }
}

function bindDesktopHover($wrapper) {
  if ($wrapper && !$wrapper.getAttribute(HOVER_BOUND_ATTR)) {
    $wrapper.setAttribute(HOVER_BOUND_ATTR, "1");
    $wrapper.addEventListener("mouseenter", () => activateWrapper($wrapper));
  }
}

export function registerDesktopHovers(root = document) {
  if (isDesktop()) {
    root.querySelectorAll(SELECTOR).forEach(($el) => {
      if (!$el.getAttribute(READY_ATTR)) {
        bindDesktopHover($el);
      }
    });
  }
}

/** Mobile only: warm the chunk without init (avoids layout work on touchstart) */
function initChunkPrefetch() {
  document.body.addEventListener(
    "touchstart",
    (e) => {
      const shouldPrefetch = !isDesktop() && !!e.target.closest(SELECTOR);

      if (shouldPrefetch) {
        loadSliderModule();
      }
    },
    { capture: true, passive: true }
  );
}

export function registerSliders(root = document) {
  const canRegister = !isDesktop() && observer;

  if (canRegister) {
    root.querySelectorAll(SELECTOR).forEach(($el) => {
      if (!$el.getAttribute(READY_ATTR)) {
        observer.observe($el);
      }
    });
  }
}

function init() {
  updateLoadStatus();

  if (isDesktop()) {
    registerDesktopHovers(document);
  } else {
    initObserver();
    initChunkPrefetch();
  }
}

init();

document.addEventListener("sliders:observe", (e) => {
  const root = e.detail?.root || document;
  registerSliders(root);
  registerDesktopHovers(root);
});
