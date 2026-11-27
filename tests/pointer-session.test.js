import test from "node:test";
import assert from "node:assert/strict";
import {
  createDragSession,
  pointFromEvent,
} from "../src/pointer-session.js";

test("pointFromEvent uses changedTouches when touches is empty (touchend)", () => {
  const point = pointFromEvent({
    touches: [],
    changedTouches: [{ screenX: 180, screenY: 40 }],
  });
  assert.equal(point.screenX, 180);
  assert.equal(point.screenY, 40);
});

test("pointFromEvent reads a mouse event", () => {
  const point = pointFromEvent({ screenX: 10, screenY: 20 });
  assert.equal(point.screenX, 10);
  assert.equal(point.screenY, 20);
});

test("end() finishes a drag even when the pointer is no longer over the tile", () => {
  const session = createDragSession();
  const wrapper = { id: "tile-1" };

  assert.equal(session.start(wrapper, { screenX: 100, screenY: 50 }), true);
  assert.equal(session.move({ screenX: 40, screenY: 52 }), -60);

  const result = session.end({ screenX: 30, screenY: 55 });
  assert.deepEqual(result, { action: "next", wrapper });
  assert.equal(session.getState().pressed, false);
  assert.equal(session.getState().activeWrapper, null);
});

test("end() without a later point still commits using the last move", () => {
  const session = createDragSession();
  const wrapper = { id: "tile-2" };

  session.start(wrapper, { screenX: 100, screenY: 50 });
  session.move({ screenX: 160, screenY: 50 });

  const result = session.end(null);
  assert.deepEqual(result, { action: "prev", wrapper });
  assert.equal(session.getState().pressed, false);
});

test("end() is a no-op when no drag is active", () => {
  const session = createDragSession();
  assert.equal(session.end({ screenX: 0, screenY: 0 }), null);
});

test("cancel() clears a stuck drag", () => {
  const session = createDragSession();
  const wrapper = { id: "tile-3" };
  session.start(wrapper, { screenX: 0, screenY: 0 });
  assert.deepEqual(session.cancel(), { action: "cancel", wrapper });
  assert.equal(session.getState().pressed, false);
});
