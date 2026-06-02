let sliderObserver;
const activeSliders = new Set();
const initializingWrappers = new WeakSet();

function parseSlides($wrapper) {
  try {
    const slides = JSON.parse($wrapper.dataset.slides);
    return Array.isArray(slides) ? slides : null;
  } catch (error) {
    console.warn("[slider] invalid data-slides JSON", error);
    return null;
  }
}

async function initSlider($wrapper) {
  if (initializingWrappers.has($wrapper) || $wrapper.dataset.sliderReady === "true") {
    return;
  }

  initializingWrappers.add($wrapper);

  try {
    const { createSlider } = await import("./slider.js");
    const slider = createSlider($wrapper);
    if (slider) {
      const originalDestroy = slider.destroy.bind(slider);
      slider.destroy = () => {
        originalDestroy();
        activeSliders.delete(slider);
      };
      activeSliders.add(slider);
      $wrapper.dataset.sliderReady = "true";
    }
  } finally {
    initializingWrappers.delete($wrapper);
  }
}

export function destroyAllSliders() {
  activeSliders.forEach((slider) => slider.destroy());
  activeSliders.clear();
  sliderObserver?.disconnect();
  sliderObserver = null;
}

export function sliderInit($wrapper = document) {
  destroyAllSliders();

  sliderObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          initSlider(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px", threshold: 0 }
  );

  const $sliders = $wrapper.querySelectorAll(".js-slider-wrapper");
  if ($sliders.length) {
    [...$sliders].forEach(($slider) => {
      if (!parseSlides($slider)) {
        return;
      }
      sliderObserver.observe($slider);
    });
  } else {
    console.warn("[slider] missing .js-slider-wrapper elements");
  }
}

sliderInit();
