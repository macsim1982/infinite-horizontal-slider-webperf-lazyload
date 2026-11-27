const MIN_X = 30;
const MAX_Y = 60;

/**
 * Mouse events are the event itself. TouchEvent.touches is empty on touchend,
 * so the lifted finger is only in changedTouches.
 */
export function pointFromEvent(e) {
  if (!e) {
    return null;
  }

  if ("touches" in e) {
    return e.touches?.[0] || e.changedTouches?.[0] || null;
  }

  if (typeof e.screenX === "number") {
    return e;
  }

  return null;
}

function resetState(state) {
  state.pressed = false;
  state.activeWrapper = null;
  state.startX = 0;
  state.startY = 0;
  state.endX = 0;
  state.endY = 0;
}

function swipeAction(state, minX, maxY) {
  const dx = state.endX - state.startX;
  const dy = state.endY - state.startY;
  const isHorizontal = Math.abs(dx) > Math.abs(dy);

  if (isHorizontal && Math.abs(dx) > minX && dy > -maxY && dy < maxY) {
    return dx > 0 ? "prev" : "next";
  }

  return "cancel";
}

/**
 * Drag state that does not depend on the pointer still being over the tile.
 * Body-level delegation never sees mouseup/touchend whose target is outside
 * `.js-slider-wrapper`, and mouseleave does not bubble, so the session must
 * be able to finish from a document-level event.
 */
export function createDragSession({ minX = MIN_X, maxY = MAX_Y } = {}) {
  const state = {
    pressed: false,
    activeWrapper: null,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  };

  return {
    getState() {
      return { ...state };
    },

    start(wrapper, point) {
      if (!wrapper || !point) {
        return false;
      }

      state.activeWrapper = wrapper;
      state.startX = point.screenX;
      state.startY = point.screenY;
      state.endX = point.screenX;
      state.endY = point.screenY;
      state.pressed = true;
      return true;
    },

    move(point) {
      if (!state.pressed || !point) {
        return null;
      }

      state.endX = point.screenX;
      state.endY = point.screenY;
      return state.endX - state.startX;
    },

    end(point) {
      if (!state.pressed) {
        return null;
      }

      if (point) {
        state.endX = point.screenX;
        state.endY = point.screenY;
      }

      const wrapper = state.activeWrapper;
      const action = swipeAction(state, minX, maxY);
      resetState(state);
      return { action, wrapper };
    },

    cancel() {
      if (!state.pressed) {
        return null;
      }

      const wrapper = state.activeWrapper;
      resetState(state);
      return { action: "cancel", wrapper };
    },
  };
}
