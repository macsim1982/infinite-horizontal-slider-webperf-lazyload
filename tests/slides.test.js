import test from "node:test";
import assert from "node:assert/strict";
import { expandSlides, canCreateSlider } from "../src/slides.js";

test(
  "expandSlides returns [] for empty input instead of looping forever",
  { timeout: 1000 },
  () => {
    assert.deepEqual(expandSlides([], 3), []);
  }
);

test("expandSlides returns [] for non-array input", () => {
  assert.deepEqual(expandSlides(null, 3), []);
  assert.deepEqual(expandSlides(undefined, 3), []);
  assert.deepEqual(expandSlides({}, 3), []);
});

test("expandSlides pads short lists to the window size", () => {
  assert.equal(expandSlides(["a"], 3).length, 3);
  assert.deepEqual(
    expandSlides(["a", "b"], 3).map((s) => s.src),
    ["a", "b", "a", "b"]
  );
});

test("expandSlides leaves long lists unchanged", () => {
  const slides = ["a", "b", "c", "d"];
  assert.deepEqual(
    expandSlides(slides, 3).map((s) => s.src),
    slides
  );
});

test("canCreateSlider rejects empty and non-array payloads", () => {
  assert.equal(canCreateSlider([]), false);
  assert.equal(canCreateSlider({}), false);
  assert.equal(canCreateSlider(null), false);
  assert.equal(canCreateSlider("[]"), false);
  assert.equal(canCreateSlider(["img.webp"]), true);
});
