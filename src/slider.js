import { render } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { multiply, translateX, fromString, toString } from "rematrix";
import { onTouchSwipe } from "./swipe.js";
import { tplSlide } from "./templates.js";

function getSlidePosition(index, total) {
  if (index === 0) return "prev";
  if (index === total - 1) return "next";
  return "current";
}

class Slider {
  constructor($wrapper, slides) {
    this.matrix = new Map();
    this.$wrapper = $wrapper;
    this.$el = $wrapper.querySelector(".js-slider");
    this.$indicators = $wrapper.querySelector(".js-indicators");
    this.$indicator = $wrapper.querySelector(".js-indicator");
    this.$elNext = $wrapper.querySelector(".js-next");
    this.$elPrev = $wrapper.querySelector(".js-prev");
    this.delta = 1;
    this.maxSlidesInDom = this.delta * 2 + 1;
    this.originalSlides = slides;
    this.destroyed = false;

    this.$wrapper.style.setProperty("--slide-count", String(slides.length));
    this.$wrapper.style.setProperty(
      "--max-slides-in-dom",
      String(this.maxSlidesInDom)
    );

    if (slides.length === 1) {
      this.$indicators.setAttribute("aria-hidden", "true");
      this.$indicators.hidden = true;
    }

    this.indicatorsWidth = this.$indicators.offsetWidth;
    this.indicatorWidth = this.$indicators.offsetWidth / slides.length;

    this.slides = this.getSlides(slides);
    this.current = this.setRealCurrent(0);
    this.slidesInDom = this.getSlidesInDom(this.current);

    this.onNextClick = this.gotoNext.bind(this);
    this.onPrevClick = this.gotoPrev.bind(this);
    this.onKeyDown = this.handleKeyDown.bind(this);
    this.onTouchStart = this.touchStart.bind(this);
    this.onTouchMove = this.touchMove.bind(this);
    this.onTouchCancel = this.touchCancel.bind(this);
    this.onSwipePrev = this.gotoPrev.bind(this);
    this.onSwipeNext = this.gotoNext.bind(this);

    this.bindEvents();
  }

  gotoPrev() {
    this.goto(-1);
  }

  gotoNext() {
    this.goto(1);
  }

  getSlides(slides) {
    let expandedSlides = [...slides];
    while (expandedSlides.length < this.maxSlidesInDom) {
      expandedSlides = expandedSlides.concat(expandedSlides);
    }
    return expandedSlides.map((src, index) => ({ src, index }));
  }

  getSlidesInDom(start = 0) {
    const rest = this.maxSlidesInDom - (this.slides.length - start);
    let slides = this.slides.slice(start, this.maxSlidesInDom + start);
    if (rest > 0) {
      slides = slides.concat(this.slides.slice(0, rest));
    }
    this.slidesInDom = slides;

    this.updateIndicator();

    render(
      repeat(
        this.slidesInDom,
        (slide) => slide.index,
        (slide, index) =>
          tplSlide({
            src: slide.src,
            position: getSlidePosition(index, this.slidesInDom.length),
            alt: `Slide ${this.getCurrentIndex() + 1} of ${this.originalSlides.length}`,
          })
      ),
      this.$el
    );

    return slides;
  }

  updateIndicator() {
    if (this.originalSlides.length <= 1) {
      this.$indicator.style.transform = "translateX(0)";
      return;
    }

    const indicatorLeft =
      ((this.indicatorsWidth - this.indicatorWidth) /
        (this.originalSlides.length - 1)) *
      this.getCurrentIndex();

    this.$indicator.style.transform = `translateX(${indicatorLeft}px)`;
  }

  getCurrentIndex() {
    return (this.current + this.delta) % this.originalSlides.length;
  }

  setCurrent(val) {
    const len = this.slides.length - 1;
    let next = this.current + val;
    if (next < 0) {
      next = len;
    } else if (next > len) {
      next = 0;
    }
    return next;
  }

  setRealCurrent(c) {
    return (c + this.slides.length - this.delta) % this.slides.length;
  }

  goto(val) {
    if (this.originalSlides.length <= 1) {
      return;
    }
    this.current = this.setCurrent(val);
    this.getSlidesInDom(this.current);
    this.touchCancel();
  }

  touchCancel() {
    [...this.$el.querySelectorAll(".item")].forEach(($el) => {
      $el.style = "";
    });
  }

  touchStart() {
    this.matrix = new Map();
    [...this.$el.querySelectorAll(".item")].forEach(($el) => {
      this.matrix.set($el, fromString(getComputedStyle($el).transform));
    });
  }

  touchMove(delta) {
    [...this.$el.querySelectorAll(".item")].forEach(($el) => {
      if (this.matrix.get($el)) {
        const matrix = [this.matrix.get($el), translateX(delta)].reduce(multiply);
        $el.style.transform = toString(matrix);
        $el.style.transition = "none";
      }
    });
  }

  handleKeyDown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      this.gotoPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      this.gotoNext();
    }
  }

  bindEvents() {
    this.$elNext.addEventListener("click", this.onNextClick);
    this.$elPrev.addEventListener("click", this.onPrevClick);
    this.$wrapper.addEventListener("keydown", this.onKeyDown);

    this.removeSwipe = onTouchSwipe(this.$wrapper, {
      left: this.onSwipePrev,
      right: this.onSwipeNext,
      start: this.onTouchStart,
      move: this.onTouchMove,
      end: this.onTouchCancel,
      cancel: this.onTouchCancel,
    });
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.$elNext.removeEventListener("click", this.onNextClick);
    this.$elPrev.removeEventListener("click", this.onPrevClick);
    this.$wrapper.removeEventListener("keydown", this.onKeyDown);
    this.removeSwipe?.();
    render("", this.$el);
  }
}

export function createSlider($wrapper) {
  let slides;

  try {
    slides = JSON.parse($wrapper.dataset.slides);
  } catch (error) {
    console.warn("[slider] invalid data-slides JSON", error);
    return null;
  }

  if (!Array.isArray(slides)) {
    console.warn("[slider] data-slides must be a JSON array");
    return null;
  }

  if (slides.length === 0) {
    console.warn("[slider] data-slides is empty");
    return null;
  }

  return new Slider($wrapper, slides);
}
