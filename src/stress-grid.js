import { buildSlides, IMG_LAZY_ATTRS } from "./picsum-pool.js";

function createTileMarkup(slides, label) {
  const dataSlides = JSON.stringify(slides).replace(/"/g, "&quot;");
  return `
    <article class="stress-tile product-tile">
      <p class="stress-tile__label">${label} — ${slides.length} image(s)</p>
      <div class="js-slider-wrapper slider-wrapper" data-slides="${dataSlides}">
        <div class="js-next nav next">next</div>
        <div class="js-prev nav prev">prev</div>
        <div class="js-slider slider">
          <img class="item" src="${slides[0]}" alt="" ${IMG_LAZY_ATTRS} />
        </div>
        <div class="js-indicators indicators">
          <div class="js-indicator indicator"></div>
        </div>
      </div>
    </article>
  `;
}

export function buildStressGridHtml() {
  const tiles = [];
  let offset = 0;

  for (let i = 0; i < 10; i++) {
    const count = 2 + (i % 2);
    tiles.push(
      createTileMarkup(buildSlides(count, offset), `Tuile légère ${i + 1}`)
    );
    offset += count;
  }

  for (let i = 0; i < 10; i++) {
    tiles.push(
      createTileMarkup(buildSlides(6, offset), `Tuile moyenne ${i + 1}`)
    );
    offset += 6;
  }

  for (let i = 0; i < 10; i++) {
    tiles.push(
      createTileMarkup(buildSlides(16, offset), `Tuile stress ${i + 1}`)
    );
    offset += 16;
  }

  return tiles.join("\n");
}
