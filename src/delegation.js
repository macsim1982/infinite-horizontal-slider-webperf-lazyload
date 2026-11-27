import { delegate } from "vanilla-delegate";
import { createDragSession, pointFromEvent } from "./pointer-session.js";

const instances = new WeakMap();
const dragSession = createDragSession();

let delegationReady = false;
let clickDelegation = null;
let touchDelegation = null;
let documentDragBound = false;

export function registerInstance($wrapper, slider) {
  instances.set($wrapper, slider);
}

export function getInstance($wrapper) {
  return instances.get($wrapper);
}

function getWrapperFromEvent(e) {
  return e.target?.closest?.(".js-slider-wrapper") || null;
}

function applyDragResult(result) {
  if (!result) {
    return;
  }

  const slider = instances.get(result.wrapper);
  unbindDocumentDrag();

  if (!slider) {
    return;
  }

  if (result.action === "prev") {
    slider.gotoPrev();
  } else if (result.action === "next") {
    slider.gotoNext();
  } else {
    slider.touchCancel();
  }
}

function onPointerStart(e) {
  if (dragSession.getState().pressed) {
    return;
  }

  const wrapper = getWrapperFromEvent(e);
  const slider = wrapper ? instances.get(wrapper) : null;
  const point = slider ? pointFromEvent(e) : null;

  if (dragSession.start(wrapper, point)) {
    slider.touchStart();
    bindDocumentDrag();
  }
}

function onPointerMove(e) {
  const delta = dragSession.move(pointFromEvent(e));
  if (delta === null) {
    return;
  }

  const { activeWrapper } = dragSession.getState();
  const slider = activeWrapper ? instances.get(activeWrapper) : null;
  slider?.touchMove(delta);
}

function onPointerEnd(e) {
  applyDragResult(dragSession.end(pointFromEvent(e)));
}

function onPointerCancel() {
  applyDragResult(dragSession.cancel());
}

function bindDocumentDrag() {
  if (documentDragBound) {
    return;
  }

  documentDragBound = true;
  document.addEventListener("mousemove", onPointerMove);
  document.addEventListener("touchmove", onPointerMove, { passive: true });
  document.addEventListener("mouseup", onPointerEnd, true);
  document.addEventListener("touchend", onPointerEnd, true);
  document.addEventListener("touchcancel", onPointerCancel, true);
  window.addEventListener("blur", onPointerCancel);
}

function unbindDocumentDrag() {
  if (!documentDragBound) {
    return;
  }

  documentDragBound = false;
  document.removeEventListener("mousemove", onPointerMove);
  document.removeEventListener("touchmove", onPointerMove);
  document.removeEventListener("mouseup", onPointerEnd, true);
  document.removeEventListener("touchend", onPointerEnd, true);
  document.removeEventListener("touchcancel", onPointerCancel, true);
  window.removeEventListener("blur", onPointerCancel);
}

export function setupDelegation() {
  if (!delegationReady) {
    delegationReady = true;

    clickDelegation = delegate(
      document.body,
      ".js-slider-wrapper .js-next, .js-slider-wrapper .js-prev",
      "click",
      (e) => {
        const btn = e.target.closest(".js-next, .js-prev");
        const wrapper = btn?.closest(".js-slider-wrapper");
        const slider = wrapper ? instances.get(wrapper) : null;

        if (btn && slider) {
          if (btn.classList.contains("js-next")) {
            slider.gotoNext();
          } else {
            slider.gotoPrev();
          }
        }
      }
    );

    // Start only: move/end must be document-level. mouseup whose target is
    // another tile never matches `.js-slider-wrapper`, and mouseleave does
    // not bubble so a body delegate never sees it — that left `pressed` stuck.
    touchDelegation = delegate(
      document.body,
      ".js-slider-wrapper",
      "touchstart,mousedown",
      onPointerStart
    );
  }
}

export function resetDelegation() {
  clickDelegation?.undelegate();
  touchDelegation?.undelegate();
  clickDelegation = null;
  touchDelegation = null;
  delegationReady = false;
  unbindDocumentDrag();
  dragSession.cancel();
}
