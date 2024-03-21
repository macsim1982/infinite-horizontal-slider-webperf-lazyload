function callback(eventName = "", args) {
  if (this && this[eventName] && typeof this[eventName] === "function") {
    this[eventName](args);
  }
}

export function onTouchSwipe($el, callbacks) {
  var startX = 0;
  var startY = 0;
  var endX = 0;
  var endY = 0;

  var minX = 30;
  var maxY = 60;
  var pressed = false;

  if ($el) {
      function touchOrMouseEvent(e) {
        return ('touches' in e) ? e.touches?.[0] : e;
      }

      function startHandler(e) {
          const t = touchOrMouseEvent(e);
          startX = t.screenX;
          startY = t.screenY;
          pressed = true;
  
          callback.call(callbacks, "start");
      }
  
      function moveHandler(e) {
          if (!pressed) return;
          const t = touchOrMouseEvent(e);
          endX = t.screenX;
          endY = t.screenY;
  
          callback.call(callbacks, "move", endX - startX);
      }
  
      function endHandler(e) {
          var isHorizontalSwipe =
              Math.abs(endX - startX) > Math.abs(endY - startY);
          var isSwipeLeft = endX > startX + minX;
          var isSwipeRight = endX < startX - minX;
          pressed = false;
  
          if (
              isHorizontalSwipe &&
              (isSwipeLeft || isSwipeRight) &&
              endY > startY - maxY &&
              endY < startY + maxY
          ) {
              callback.call(callbacks, endX > startX ? "left" : "right", e);
          }
  
          callback.call(callbacks, "end", endX - startX);
  
          startX = 0;
          startY = 0;
          endX = 0;
          endY = 0;
      }

      function cancelHandler() {
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
  }
}