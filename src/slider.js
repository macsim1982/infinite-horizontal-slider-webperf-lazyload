import { render } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { onTouchSwipe } from "vanilla-touchswipe";
import { multiply, translateX, fromString, toString } from "rematrix";
import { tplSlide } from "./templates.js";

let sliderObserver;

class Slider {
  constructor($wrapper, props) {
    this.matrix = new Map();
    this.$wrapper = $wrapper;
    this.$el = $wrapper.querySelector(".js-slider");
    this.$indicators = $wrapper.querySelector(".js-indicators");
    this.$indicator = $wrapper.querySelector(".js-indicator");
    this.$elNext = $wrapper.querySelector(".js-next");
    this.$elPrev = $wrapper.querySelector(".js-prev");
    this.delta = 1; // Be careful if this is change - update css .slide:nth-child(n) if delta = 2  we will have 5 slides in dom instead of 3
    this.maxSlidesInDom = this.delta * 2 + 1;
    this.originalSlides = props.slides;

    this.indicatorsWidth = this.$indicators.offsetWidth;
    this.indicatorWidth = this.$indicator.offsetWidth;

    this.slides = this.getSlides(this.originalSlides);
    this.current = this.setRealCurrent(0);
    this.slidesInDom = this.getSlidesInDom(this.current);

    this.bindEvents();
  }

  gotoPrev() {
    this.goto(-1);
  }

  gotoNext() {
    this.goto(1);
  }

  getSlides(slides) {
    while (slides.length < this.maxSlidesInDom) {
      slides = slides.concat(slides);
    }
    return slides.map((e, index) => ({ src: e, index: index }));
  }

  getSlidesInDom(start = 0) {
    console.log(
      "getSlidesInDom",
      this.current,
      this.delta,
      this.maxSlidesInDom
    );
    const rest = this.maxSlidesInDom - (this.slides.length - start);
    let slides = this.slides.slice(start, this.maxSlidesInDom + start);
    if (rest > 0) {
      slides = slides.concat(this.slides.slice(0, rest));
    }
    this.slidesInDom = slides;

    const indicatorLeft =
      ((this.indicatorsWidth - this.indicatorWidth) /
        (this.originalSlides.length - 1)) *
      this.getCurrentIndex();

    this.$indicator.style.transform = "translateX(" + indicatorLeft + "px)";
    render(
      repeat(this.slidesInDom, (i) => i.index, tplSlide),
      this.$el
    );
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
    [...this.$el.querySelectorAll(".item")].forEach($el => {
      this.matrix.set($el, fromString(getComputedStyle($el).transform));
    });
  }

  touchMove(delta) {
    [...this.$el.querySelectorAll(".item")].forEach($el => {
      if (this.matrix.get($el)) {
        const matrix = [this.matrix.get($el), translateX(delta)].reduce(multiply);
        $el.style.transform = toString(matrix);
        $el.style.transition = "none";
      }
    });
  }

  bindEvents() {
    this.$elNext.addEventListener("click", this.gotoNext.bind(this));
    this.$elPrev.addEventListener("click", this.gotoPrev.bind(this));

    onTouchSwipe(this.$wrapper, {
      left: this.gotoPrev.bind(this),
      right: this.gotoNext.bind(this),
      start: this.touchStart.bind(this),
      move: this.touchMove.bind(this),
      end: this.touchCancel.bind(this),
      cancel: this.touchCancel.bind(this),
    });
  }
}

export function sliderInit($wrapper = document) {
  sliderObserver && sliderObserver.disconnect();

  sliderObserver = new IntersectionObserver(
    (entries, observer) => {
      for (let entry of entries) {
        if (entry.intersectionRatio > 0) {
          new Slider(entry.target, {
            slides: JSON.parse(entry.target.dataset.slides),
          });
          observer.unobserve(entry.target);

          console.log("observe this entry", entry);
        }
      }
    },
    { rootMargin: "0px 0px 0px 0px", threshold: 0 }
  );

  const $sliders = $wrapper.querySelectorAll(".js-slider-wrapper");
  if ($sliders.length) {
      [...$sliders].forEach($slider => {
        sliderObserver.observe($slider);
      });
  } else {
    console.warn("warn [touch-slider]", "missing element");
  }
}