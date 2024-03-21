import { html } from "lit-html";

export function tplSlide({ src }) {
  return html`<img class="item slide" src="${src}" onmousedown='return false;' ondragstart='return false;'/>`;
}
