import { html } from "lit-html";
import { BASE_URL, IMG_HEIGHT, IMG_WIDTH } from "./const.js";

export function tplSlide({ src }) {
  return html`<img
    class="item slide"
    src="${BASE_URL}${src}"
    loading="auto"
    decoding="async"
    width="${IMG_WIDTH}"
    height="${IMG_HEIGHT}"
    onmousedown="return false;"
    ondragstart="return false;"
  />`;
}
