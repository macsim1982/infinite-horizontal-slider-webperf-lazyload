import { render } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { multiply, translateX, fromString, toString } from "rematrix";
import { tplSlide } from "./templates.js";
import { registerInstance } from "./delegation.js";
import { expandSlides } from "./slides.js";

export { setupDelegation, resetDelegation } from "./delegation.js";
export { expandSlides, canCreateSlider } from "./slides.js";

class Slider {
  constructor($wrapper, props) {
    this.matrix = new Map();
    this.$wrapper = $wrapper;
    this.$el = $wrapper.querySelector(".js-slider");
    this.$indicators = $wrapper.querySelector(".js-indicators");
    this.$indicator = $wrapper.querySelector(".js-indicator");
    this.delta = 1;
    this.maxSlidesInDom = this.delta * 2 + 1;
    this.originalSlides = Array.isArray(props.slides) ? props.slides : [];

    this.indicatorsWidth = this.$indicators?.offsetWidth || 0;
    this.indicatorWidth = this.$indicator?.offsetWidth || 0;

    this.slides = this.getSlides(this.originalSlides);
    this.current = this.slides.length ? this.setRealCurrent(0) : 0;
    this.slidesInDom = [];
    if (this.slides.length) {
      this.getSlidesInDom(this.current);
    }
  }

  gotoPrev() {
    this.goto(-1);
  }

  gotoNext() {
    this.goto(1);
  }

  getSlides(slides) {
    return expandSlides(slides, this.maxSlidesInDom);
  }

  getSlidesInDom(start = 0) {
    const rest = this.maxSlidesInDom - (this.slides.length - start);
    let slides = this.slides.slice(start, this.maxSlidesInDom + start);
    if (rest > 0) {
      slides = slides.concat(this.slides.slice(0, rest));
    }
    this.slidesInDom = slides;

    const lastIndex = this.originalSlides.length - 1;
    const indicatorLeft =
      lastIndex > 0
        ? ((this.indicatorsWidth - this.indicatorWidth) / lastIndex) *
          this.getCurrentIndex()
        : 0;

    if (this.$indicator) {
      this.$indicator.style.transform = "translateX(" + indicatorLeft + "px)";
    }
    render(
      repeat(this.slidesInDom, (i) => i.index, tplSlide),
      this.$el
    );
  }

  getCurrentIndex() {
    const len = this.originalSlides.length;
    if (!len) {
      return 0;
    }
    return (this.current + this.delta) % len;
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
        const matrix = [this.matrix.get($el), translateX(delta)].reduce(
          multiply
        );
        $el.style.transform = toString(matrix);
        $el.style.transition = "none";
      }
    });
  }
}

export function createSlider($wrapper, props) {
  const slider = new Slider($wrapper, props);
  registerInstance($wrapper, slider);
  return slider;
}
