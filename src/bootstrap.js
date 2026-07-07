const SELECTOR = ".js-slider-wrapper";
const READY_ATTR = "data-slider-ready";

let sliderModulePromise = null;
let observer = null;
let chunkLoaded = false;

function isDesktop() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function updateLoadStatus() {
  const status = document.getElementById("js-load-status");
  if (!status) return;

  const mode = isDesktop() ? "hover" : "viewport";
  status.textContent = chunkLoaded
    ? `Bootstrap chargé (${mode}) — chunk slider : chargé (1 fetch)`
    : `Bootstrap chargé (${mode}) — chunk slider : non`;
}

function loadSliderModule() {
  if (!sliderModulePromise) {
    sliderModulePromise = import("./slider.js").then((mod) => {
      chunkLoaded = true;
      updateLoadStatus();
      return mod;
    });
  }
  return sliderModulePromise;
}

async function activateWrapper($wrapper) {
  if (!$wrapper || $wrapper.getAttribute(READY_ATTR)) return;

  const slidesRaw = $wrapper.dataset.slides;
  if (!slidesRaw) return;

  let slides;
  try {
    slides = JSON.parse(slidesRaw);
  } catch {
    return;
  }

  const { createSlider, setupDelegation } = await loadSliderModule();
  setupDelegation();

  $wrapper.setAttribute(READY_ATTR, "1");
  createSlider($wrapper, { slides });
  observer?.unobserve($wrapper);
}

async function activateWrappers(wrappers) {
  await Promise.all(wrappers.map((wrapper) => activateWrapper(wrapper)));
}

function initObserver() {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.intersectionRatio > 0)
        .map((entry) => entry.target);
      if (visible.length) activateWrappers(visible);
    },
    { rootMargin: "0px", threshold: 0 }
  );

  registerSliders(document);
}

function initDesktopHover() {
  document.body.addEventListener("mouseover", (e) => {
    const wrapper = e.target.closest(SELECTOR);
    if (!wrapper) return;

    const from = e.relatedTarget;
    if (from && wrapper.contains(from)) return;

    activateWrapper(wrapper);
  });
}

/** Mobile only: warm the chunk without init (avoids layout work on touchstart) */
function initChunkPrefetch() {
  document.body.addEventListener(
    "touchstart",
    (e) => {
      if (isDesktop()) return;
      if (e.target.closest(SELECTOR)) loadSliderModule();
    },
    { capture: true, passive: true }
  );
}

export function registerSliders(root = document) {
  if (isDesktop() || !observer) return;

  root.querySelectorAll(SELECTOR).forEach(($el) => {
    if (!$el.getAttribute(READY_ATTR)) {
      observer.observe($el);
    }
  });
}

function init() {
  updateLoadStatus();

  if (isDesktop()) {
    initDesktopHover();
  } else {
    initObserver();
    initChunkPrefetch();
  }
}

init();

document.addEventListener("sliders:observe", (e) => {
  registerSliders(e.detail?.root || document);
});
