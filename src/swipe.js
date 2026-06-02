function callback(eventName = "", args) {
  if (this && this[eventName] && typeof this[eventName] === "function") {
    this[eventName](args);
  }
}

export function onTouchSwipe($el, callbacks) {
  if (!$el) {
    return () => {};
  }

  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  const minX = 30;
  const maxY = 60;
  let pressed = false;

  function touchOrMouseEvent(e) {
    return "touches" in e ? e.touches?.[0] : e;
  }

  function startHandler(e) {
    const t = touchOrMouseEvent(e);
    if (!t) return;
    startX = t.screenX;
    startY = t.screenY;
    pressed = true;
    callback.call(callbacks, "start");
  }

  function moveHandler(e) {
    if (!pressed) return;
    const t = touchOrMouseEvent(e);
    if (!t) return;
    endX = t.screenX;
    endY = t.screenY;
    callback.call(callbacks, "move", endX - startX);
  }

  function endHandler() {
    const isHorizontalSwipe = Math.abs(endX - startX) > Math.abs(endY - startY);
    const isSwipeLeft = endX > startX + minX;
    const isSwipeRight = endX < startX - minX;
    pressed = false;

    if (
      isHorizontalSwipe &&
      (isSwipeLeft || isSwipeRight) &&
      endY > startY - maxY &&
      endY < startY + maxY
    ) {
      callback.call(callbacks, endX > startX ? "left" : "right");
    }

    callback.call(callbacks, "end", endX - startX);

    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
  }

  function cancelHandler() {
    pressed = false;
    callback.call(callbacks, "cancel");
  }

  $el.addEventListener("touchstart", startHandler, true);
  $el.addEventListener("mousedown", startHandler, true);
  $el.addEventListener("touchmove", moveHandler, true);
  $el.addEventListener("mousemove", moveHandler, true);
  $el.addEventListener("touchcancel", cancelHandler, true);
  $el.addEventListener("mouseleave", endHandler, true);
  $el.addEventListener("touchend", endHandler, true);
  $el.addEventListener("mouseup", endHandler, true);

  return () => {
    $el.removeEventListener("touchstart", startHandler, true);
    $el.removeEventListener("mousedown", startHandler, true);
    $el.removeEventListener("touchmove", moveHandler, true);
    $el.removeEventListener("mousemove", moveHandler, true);
    $el.removeEventListener("touchcancel", cancelHandler, true);
    $el.removeEventListener("mouseleave", endHandler, true);
    $el.removeEventListener("touchend", endHandler, true);
    $el.removeEventListener("mouseup", endHandler, true);
  };
}
