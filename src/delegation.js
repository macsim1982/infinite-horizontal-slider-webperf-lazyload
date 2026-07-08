import { delegate } from "vanilla-delegate";
const instances = new WeakMap();

let delegationReady = false;
let clickDelegation = null;
let touchDelegation = null;

let activeWrapper = null;
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;
let pressed = false;

const MIN_X = 30;
const MAX_Y = 60;

export function registerInstance($wrapper, slider) {
  instances.set($wrapper, slider);
}

export function getInstance($wrapper) {
  return instances.get($wrapper);
}

function touchOrMouseEvent(e) {
  return "touches" in e ? e.touches?.[0] : e;
}

function getWrapperFromEvent(e) {
  return e.target.closest(".js-slider-wrapper");
}

function handleSwipe(slider) {
  const isHorizontalSwipe = Math.abs(endX - startX) > Math.abs(endY - startY);
  const isSwipeLeft = endX > startX + MIN_X;
  const isSwipeRight = endX < startX - MIN_X;

  if (
    isHorizontalSwipe &&
    (isSwipeLeft || isSwipeRight) &&
    endY > startY - MAX_Y &&
    endY < startY + MAX_Y
  ) {
    if (endX > startX) {
      slider.gotoPrev();
    } else {
      slider.gotoNext();
    }
  } else {
    slider.touchCancel();
  }
}

function onPointerStart(e) {
  const wrapper = getWrapperFromEvent(e);
  const slider = wrapper ? instances.get(wrapper) : null;
  const touch = slider ? touchOrMouseEvent(e) : null;

  if (wrapper && slider && touch) {
    activeWrapper = wrapper;
    startX = touch.screenX;
    startY = touch.screenY;
    endX = startX;
    endY = startY;
    pressed = true;
    slider.touchStart();
  }
}

function onPointerMove(e) {
  const wrapper = getWrapperFromEvent(e) || activeWrapper;
  const slider =
    pressed &&
    activeWrapper &&
    wrapper === activeWrapper
      ? instances.get(activeWrapper)
      : null;
  const touch = slider ? touchOrMouseEvent(e) : null;

  if (touch) {
    endX = touch.screenX;
    endY = touch.screenY;
    slider.touchMove(endX - startX);
  }
}

function onPointerEnd(e) {
  const canHandle = pressed && activeWrapper;
  const slider = canHandle ? instances.get(activeWrapper) : null;
  const touch = slider ? touchOrMouseEvent(e) : null;

  if (slider) {
    if (touch) {
      endX = touch.screenX;
      endY = touch.screenY;
    }

    handleSwipe(slider);

    pressed = false;
    activeWrapper = null;
    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
  }
}

function onPointerCancel() {
  const slider = pressed && activeWrapper ? instances.get(activeWrapper) : null;

  if (slider) {
    slider.touchCancel();

    pressed = false;
    activeWrapper = null;
    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
  }
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

    touchDelegation = delegate(
      document.body,
      ".js-slider-wrapper",
      "touchstart,touchmove,touchend,touchcancel,mousedown,mousemove,mouseup,mouseleave",
      (e) => {
        if (e.type === "touchstart" || e.type === "mousedown") {
          onPointerStart(e);
        } else if (e.type === "touchmove" || e.type === "mousemove") {
          onPointerMove(e);
        } else if (e.type === "touchend" || e.type === "mouseup") {
          onPointerEnd(e);
        } else if (e.type === "touchcancel" || e.type === "mouseleave") {
          onPointerCancel();
        }
      }
    );
  }
}

export function resetDelegation() {
  clickDelegation?.undelegate();
  touchDelegation?.undelegate();
  clickDelegation = null;
  touchDelegation = null;
  delegationReady = false;
  pressed = false;
  activeWrapper = null;
}
