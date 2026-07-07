const SELECTOR = ".js-slider-wrapper";
const READY_ATTR = "data-slider-ready";

let sliderModulePromise = null;
let observer = null;
let chunkLoaded = false;

function updateLoadStatus() {
  const status = document.getElementById("js-load-status");
  if (!status) return;

  status.textContent = chunkLoaded
    ? "Bootstrap chargé — chunk slider : chargé (1 fetch)"
    : "Bootstrap chargé — chunk slider : non";
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
    const fallback = [...document.querySelectorAll(SELECTOR)];
    if (fallback.length) activateWrappers(fallback);
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

  observeNewSliders(document);
}

function initIntentPrefetch() {
  const onIntent = (e) => {
    const wrapper = e.target.closest(SELECTOR);
    if (wrapper) activateWrapper(wrapper);
  };

  document.body.addEventListener("touchstart", onIntent, {
    capture: true,
    passive: true,
  });
  document.body.addEventListener("mousedown", onIntent, { capture: true });
}

export function observeNewSliders(root = document) {
  if (!observer) return;

  root.querySelectorAll(SELECTOR).forEach(($el) => {
    if (!$el.getAttribute(READY_ATTR)) {
      observer.observe($el);
    }
  });
}

updateLoadStatus();
initObserver();
initIntentPrefetch();

document.addEventListener("sliders:observe", (e) => {
  observeNewSliders(e.detail?.root || document);
});
