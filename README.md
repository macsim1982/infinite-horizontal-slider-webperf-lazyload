# Infinite horizontal slider — webperf lazyload

POC d'un slider produit PLP e-commerce : DOM minimal, chunk JS lazy, délégation d'événements, animations GPU-friendly.

## Architecture

```
bootstrap.js (defer, ~1.7 KB)
  ├── IntersectionObserver — init au viewport
  ├── Prefetch interaction — touchstart / mousedown sur .js-slider-wrapper
  └── import('./slider.js') — uniquement à la consommation

slider.js (chunk async, ~20 KB)
  ├── lit-html — rendu 3 slides max
  ├── rematrix — transform pendant le swipe
  └── vanilla-delegate — clic + touch délégués sur document.body
```

Au load de la page : **aucun chunk slider**. Seul le bootstrap est téléchargé.

## Démos

| Page | Usage |
|---|---|
| [index.html](index.html) | Démo simple — 4 sliders |
| [stress.html](stress.html) | Stress test — hero 100vh puis ~30 tuiles (2, 6 ou 16 images) |

**Stress test :** rester sur le hero, ouvrir DevTools → Network → recharger. Constater l'absence du chunk `slider` avant scroll.

Live : [infinite-horizontal-slider-webperf-lazyload.vercel.app](https://infinite-horizontal-slider-webperf-lazyload.vercel.app/)

## Install

```sh
npm install
```

## Usage

```sh
npm run start          # index.html
npm run start:stress   # stress.html (case study)
npm run build
```

## Intégration SFCC (markup)

```html
<div class="js-slider-wrapper slider-wrapper" data-slides='["url1","url2"]'>
  <div class="js-next nav next">next</div>
  <div class="js-prev nav prev">prev</div>
  <div class="js-slider slider">
    <img class="item" src="url1" alt="" />
  </div>
  <div class="js-indicators indicators">
    <div class="js-indicator indicator"></div>
  </div>
</div>

<script src="/js/bootstrap.js" type="module" defer></script>
```

## Dépendances

- [lit-html](https://lit.dev/) — templating
- [rematrix](https://www.npmjs.com/package/rematrix) — matrices CSS transform
- [vanilla-delegate](https://github.com/macsim1982/vanilla-delegate) — délégation d'événements

## Author

**Maxime Lerouge** — [macsim.fr](http://macsim.fr) · [@macsim1982](https://github.com/macsim1982)
