import { html } from "lit-html";

const positionClasses = {
  prev: "slide-prev",
  current: "slide-current",
  next: "slide-next",
};

export function tplSlide({ src, position, alt }) {
  const positionClass = positionClasses[position] || "slide-current";
  return html`<img
    class="item slide ${positionClass}"
    src="${src}"
    alt="${alt}"
    onmousedown="return false;"
    ondragstart="return false;"
  />`;
}
