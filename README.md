<h1 align="center">Welcome to Infinite horizontal slider - webperf lazyload 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
</p>

> A vanilla JavaScript slider that lazy-loads its JavaScript when each slider enters the viewport. On intersection, the slider module is dynamically imported, the current DOM is replaced with a lit-html template, and users can swipe or navigate between images. This is a proof of concept.

### 🏠 [Homepage](index.html)

## Install

```sh
npm install
```

## Usage

```sh
npm run start
```

## How lazy loading works

- [`src/index.js`](src/index.js) registers an `IntersectionObserver` on each `.js-slider-wrapper`.
- When a slider enters the viewport, Parcel loads [`src/slider.js`](src/slider.js) via dynamic `import()`.
- Only then are lit-html, rematrix, and swipe handling initialized for that slider.

## Author

👤 **Maxime Lerouge**

* Website: http://macsim.fr
* Github: [@macsim1982](https://github.com/macsim1982)

## Demo (mobile only for the moment)
Demo for mobile or by using devtools in Chrome to emulate mobile (https://infinite-horizontal-slider-webperf-lazyload.vercel.app/)
