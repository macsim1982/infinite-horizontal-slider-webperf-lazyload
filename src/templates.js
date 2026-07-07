import { html } from "lit-html";
import { IMG_HEIGHT, IMG_WIDTH } from "./picsum-pool.js";

export function tplSlide({ src }) {
  return html`<img
    class="item slide"
    src="${src}"
    loading="lazy"
    decoding="async"
    width="${IMG_WIDTH}"
    height="${IMG_HEIGHT}"
    onmousedown="return false;"
    ondragstart="return false;"
  />`;
}
