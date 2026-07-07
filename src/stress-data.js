const PICSUM_BASE = "https://picsum.photos/id";

function imageUrl(id, w = 500, h = 700) {
  return `${PICSUM_BASE}/${id}/${w}/${h}`;
}

function buildSlides(count, startId) {
  return Array.from({ length: count }, (_, i) => imageUrl(startId + i));
}

function createTileMarkup(slides, label) {
  const dataSlides = JSON.stringify(slides).replace(/"/g, "&quot;");
  return `
    <article class="stress-tile">
      <p class="stress-tile__label">${label} — ${slides.length} image(s)</p>
      <div class="js-slider-wrapper slider-wrapper" data-slides="${dataSlides}">
        <div class="js-next nav next">next</div>
        <div class="js-prev nav prev">prev</div>
        <div class="js-slider slider">
          <img class="item" src="${slides[0]}" alt="" />
        </div>
        <div class="js-indicators indicators">
          <div class="js-indicator indicator"></div>
        </div>
      </div>
    </article>
  `;
}

function renderStressGrid() {
  const grid = document.getElementById("js-stress-grid");
  if (!grid) return;

  const tiles = [];
  let id = 100;

  for (let i = 0; i < 10; i++) {
    tiles.push(createTileMarkup(buildSlides(2 + (i % 2), id), `Tuile légère ${i + 1}`));
    id += 3;
  }

  for (let i = 0; i < 10; i++) {
    tiles.push(createTileMarkup(buildSlides(6, id), `Tuile moyenne ${i + 1}`));
    id += 6;
  }

  for (let i = 0; i < 10; i++) {
    tiles.push(createTileMarkup(buildSlides(16, id), `Tuile stress ${i + 1}`));
    id += 16;
  }

  grid.innerHTML = tiles.join("");

  document.dispatchEvent(
    new CustomEvent("sliders:observe", { detail: { root: grid } })
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderStressGrid);
} else {
  renderStressGrid();
}
