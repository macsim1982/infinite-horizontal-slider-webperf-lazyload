/**
 * Repeat the source list until there are enough slides for the 3-slot window.
 * Empty / non-array input must not enter the pad loop: `[...[]]` stays empty,
 * so `push(...[])` would spin forever and freeze the tab.
 */
export function expandSlides(slides, maxSlidesInDom) {
  if (!Array.isArray(slides) || slides.length === 0) {
    return [];
  }

  const expanded = [...slides];
  while (expanded.length < maxSlidesInDom) {
    expanded.push(...slides);
  }
  return expanded.map((src, index) => ({ src, index }));
}

export function canCreateSlider(slides) {
  return Array.isArray(slides) && slides.length > 0;
}
