# Infinite horizontal slider — webperf lazyload

POC d'un slider produit PLP e-commerce : DOM minimal, chunk JS lazy, délégation d'événements, animations GPU-friendly.

## Architecture

```
bootstrap.js (defer, ~1.7 KB)
  ├── Desktop — init au mouseenter de .js-slider-wrapper (product-tile)
  ├── Mobile  — IntersectionObserver (init au viewport)
  ├── Mobile  — prefetch chunk au touchstart (download only, no init)
  └── import('./slider.js') — à la consommation

slider.js (chunk async, ~20 KB)
  ├── lit-html — rendu 3 slides max
  ├── rematrix — transform pendant le swipe
  └── vanilla-delegate — clic + touch délégués sur document.body
```

Au load : **aucun chunk slider**, **un seul JS** (`bootstrap.js`) — les ~30 tuiles produit sont déjà dans le HTML (générées au build, comme une PLP SFCC server-rendered). Sur mobile, le touchstart ne fait que précharger le JS — l'init (calculs layout) reste sur l'IntersectionObserver pour éviter le jank au premier geste.

## Grille stress (HTML statique)

La page [`index.html`](index.html) simule une PLP SFCC : les tuiles sont injectées dans le HTML au **build**, pas au runtime.

```
src/stress-grid.js          — logique de génération
scripts/generate-stress-grid.mjs — injecte le markup entre marqueurs dans index.html
prestart / prebuild         — régénère automatiquement avant dev et prod
```

En production SFCC, le template ISML serveur remplace ce script de build.

```sh
npm run generate:stress-grid   # régénérer manuellement
```

## Démos

| Page | Commande |
|---|---|
| [index.html](index.html) | `npm start` (défaut) |

**Stress test :** rester sur le hero, ouvrir DevTools → Network → recharger. Constater : un seul petit JS `bootstrap` au load, les tuiles déjà visibles dans le DOM (Elements), absence du chunk `slider` avant scroll (mobile) ou survol tuile (desktop).

Live : [infinite-horizontal-slider-webperf-lazyload.vercel.app](https://infinite-horizontal-slider-webperf-lazyload.vercel.app/)

## Install

```sh
npm install
```

## Usage

```sh
npm run start   # index.html
npm run build
```

## Intégration SFCC (markup)

```html
<div class="js-slider-wrapper slider-wrapper" data-slides='["url1","url2"]'>
  <div class="js-next nav next">next</div>
  <div class="js-prev nav prev">prev</div>
  <div class="js-slider slider">
    <img class="item" src="url1" alt="" loading="lazy" decoding="async" width="500" height="700" />
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
