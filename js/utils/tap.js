
/*

 IONIC TAP
 ---------------
 - Both touch and mouse events are added to the document.body on DOM ready
 - If a touch event happens, it removes the mouse event listeners (temporarily)
 - Remembers the last touchstart event
 - On touchend, if the distance between start and end was small, trigger a click
 - In the triggered click event, add a 'isIonicTap' property
 - The triggered click receives the same x,y coordinates as as the end event
 - On document.body click listener (with useCapture=true), only allow clicks with 'isIonicTap'
 - After XXms, bring back the mouse event listeners incase they switch from touch and mouse
 - If no touch events and only mouse, then touch events never fire, only mouse
 - Triggering clicks with mouse events work the same as touch, except with mousedown/mouseup

 - Does not require other libraries to hook into ionic.tap, it just works
 - Elements can come and go from the DOM and it doesn't have to keep adding and removing listeners
 - No "tap delay" after the first "tap" (you can tap as fast as you want, they all click)
 - Minimal events listeners, only being added to document.body
 - Correct focus in/out on each input type on each platform/device
 - Shows and hides virtual keyboard correctly for each platform/device
 - No user-agent sniffing
 - Works with labels surrounding inputs
 - Does not fire off a click if the user moves the pointer too far
 - Adds and removes an 'activated' css class
 - Multiple unit tests for each scenario

*/

var tapDoc; // the element which the listeners are on (document.body)
var tapActiveEle; // the element which is active (probably has focus)
var tapEnabledTouchEvents;
var tapMouseResetTimer;
var tapPointerMoved;
var tapPointerStart;

var TAP_RELEASE_TOLERANCE = 6; // how much the coordinates can be off between start/end, but still a click

var tapEventListeners = {
  'click': tapClickGateKeeper,

  'mousedown': tapMouseDown,
  'mouseup': tapMouseUp,
  'mousemove': tapMouseMove,

  'touchstart': tapTouchStart,
  'touchend': tapTouchEnd,
  'touchcancel': tapTouchCancel,
  'touchmove': tapTouchMove,

  'focusout': tapFocusOut
};

ionic.tap = {

  register: function(ele) {
    tapDoc = ele;

    tapEventListener('click', true, true);
    tapEventListener('mouseup');
    tapEventListener('mousedown');
    tapEventListener('touchstart');
    tapEventListener('touchend');
    tapEventListener('touchcancel');
    tapEventListener('focusout');

    return function() {
      for(var type in tapEventListeners) {
        tapEventListener(type, false);
      }
      tapDoc = null;
      tapActiveEle = null;
      tapEnabledTouchEvents = false;
      tapPointerMoved = false;
      tapPointerStart = null;
    }
  },

  ignoreScrollStart: function(e) {
    return (e.defaultPrevented) ||  // defaultPrevented has been assigned by another component handling the event
           ((/input|textarea|select/i).test(e.target.tagName) && tapActiveElement() === e.target) || // target is the active element, so its a second tap to select input text
           (e.target.isContentEditable) ||
           (e.target.dataset ? e.target.dataset.preventScroll : e.target.getAttribute('data-prevent-default')) == 'true' || // manually set within an elements attributes
           (!!(/object|embed/i).test(e.target.tagName));  // flash/movie/object touches should not try to scroll
  }

};

function tapEventListener(type, enable, useCapture) {
  if(enable !== false) {
    tapDoc.addEventListener(type, tapEventListeners[type], useCapture);
  } else {
    tapDoc.removeEventListener(type, tapEventListeners[type]);
  }
}

function tapClick(e) {
  // simulate a normal click by running the element's click method then focus on it
  var ele = tapTargetElement(e);

  if( tapRequiresNativeClick(ele) || tapPointerMoved ) return false;

  var c = getPointerCoordinates(e);

  console.debug('tapClick', e.type, ele.tagName, '('+c.x+','+c.y+')');

  // using initMouseEvent instead of MouseEvent for our Android friends
  var clickEvent = document.createEvent("MouseEvents");
  clickEvent.initMouseEvent('click', true, true, window,
                            1, 0, 0, c.x, c.y,
                            false, false, false, false, 0, null);
  clickEvent.isIonicTap = true;
  ele.dispatchEvent(clickEvent);

  // if it's an input, focus in on the target, otherwise blur
  tapHandleFocus(ele);

  if(e.target.tagName == 'LABEL') {
    console.debug('label preventDefault');
    e.preventDefault();
  }
}

function tapClickGateKeeper(e) {
  // do not allow through any click events that were not created by ionic.tap
  if( !e.isIonicTap && !tapRequiresNativeClick(e.target) ) {
    console.debug('clickPrevent', e.target.tagName);
    e.stopPropagation();
    e.preventDefault();
    return false;
  }
}

function tapRequiresNativeClick(ele) {
  if(!ele || ele.disabled || ele.type === 'range' || ele.type === 'file' || ele.tagName === 'VIDEO' || ele.tagName === 'OBJECT' ) {
    return true;
  }
  if(ele.nodeType === 1) {
    var element = ele;
    while(element) {
      if( (element.dataset ? element.dataset.tapDisabled : element.getAttribute('data-tap-disabled')) == 'true' ) {
        return true;
      }
      element = element.parentElement;
    }
  }
  return false;
}

// MOUSE
function tapMouseDown(e) {
  if(e.isTapHandled) return;
  e.isTapHandled = true;
  tapPointerMoved = false;

  tapPointerStart = getPointerCoordinates(e);

  if(tapEnabledTouchEvents && !e.isIonicMouseDown) {
    console.debug('mouseDownPrevent');
    e.stopPropagation();
    e.preventDefault();
    return false;
  }

  tapEventListener('mousemove');
  ionic.activator.start(e);
}

function tapMouseUp(e) {
  if(e.isTapHandled) return;
  e.isTapHandled = true;

  if( !tapHasPointerMoved(e) ) {
    tapClick(e);
  }
  tapEventListener('mousemove', false);
  ionic.activator.end();
  tapPointerMoved = false;
}

function tapMouseMove(e) {
  if( tapHasPointerMoved(e) ) {
    tapEventListener('mousemove', false);
    ionic.activator.end();
    tapPointerMoved = true;
    return false;
  }
}


// TOUCH
function tapTouchStart(e) {
  if(e.isTapHandled) return;
  e.isTapHandled = true;
  tapPointerMoved = false;

  tapEnableTouchEvents();
  tapPointerStart = getPointerCoordinates(e);

  tapEventListener('touchmove');
  ionic.activator.start(e);
}

function tapTouchEnd(e) {
  if(e.isTapHandled) return;
  e.isTapHandled = true;

  tapEnableTouchEvents();
  if( !tapHasPointerMoved(e) ) {
    tapClick(e);
  }

  tapTouchCancel();
}

function tapTouchMove(e) {
  if( tapHasPointerMoved(e) ) {
    tapPointerMoved = true;
    tapEventListener('touchmove', false);
    ionic.activator.end();
    return false;
  }
}

function tapTouchCancel(e) {
  tapEventListener('touchmove', false);
  ionic.activator.end();
  tapPointerMoved = false;
}

function tapEnableTouchEvents() {
  if(!tapEnabledTouchEvents) {
    tapEventListener('mouseup', false);
    tapEnabledTouchEvents = true;
  }
  clearTimeout(tapMouseResetTimer);
  tapMouseResetTimer = setTimeout(tapResetMouseEvent, 2500);
}

function tapResetMouseEvent() {
  tapEventListener('mouseup', false);
  tapEnabledTouchEvents = false;
}

function tapHandleFocus(ele) {
  if(ele.tagName == 'SELECT') {
    // trick to force Android options to show up
    console.debug('tapHandleFocus', ele.tagName);
    var clickEvent = document.createEvent("MouseEvents");
    clickEvent.initMouseEvent('mousedown', true, true, window,
                              1, 0, 0, 0, 0,
                              false, false, false, false, 0, null);
    clickEvent.isIonicMouseDown = true;
    ele.dispatchEvent(clickEvent);
    tapActiveElement(ele);
    ele.focus && ele.focus();

  } else if(tapActiveElement() !== ele) {
    if( (/input|textarea/i).test(ele.tagName) ) {
      console.debug('tapHandleFocus', ele.tagName);
      tapActiveElement(ele);
      ele.focus();
    } else {
      tapFocusOutActive();
    }
  }
}

function tapFocusOutActive() {
  var ele = tapActiveElement();
  if(ele && (/input|textarea|select/i).test(ele.tagName) ) {
    console.debug('tapFocusOutActive', ele.tagName);
    ele.blur();
  }
  tapActiveElement(null);
}

function tapFocusOut() {
  tapActiveElement(null);
}

function tapActiveElement(ele) {
  if(arguments.length) {
    tapActiveEle = ele;
  }
  return tapActiveEle || document.activeElement;
}

function tapHasPointerMoved(endEvent) {
  if(!endEvent || !tapPointerStart || ( tapPointerStart.x === 0 && tapPointerStart.y === 0 )) {
    return false;
  }
  var endCoordinates = getPointerCoordinates(endEvent);

  return Math.abs(tapPointerStart.x - endCoordinates.x) > TAP_RELEASE_TOLERANCE ||
         Math.abs(tapPointerStart.y - endCoordinates.y) > TAP_RELEASE_TOLERANCE;
}

function getPointerCoordinates(event) {
  // This method can get coordinates for both a mouse click
  // or a touch depending on the given event
  var c = { x:0, y:0 };
  if(event) {
    var touches = event.touches && event.touches.length ? event.touches : [event];
    var e = (event.changedTouches && event.changedTouches[0]) || touches[0];
    if(e) {
      c.x = e.clientX || e.pageX || 0;
      c.y = e.clientY || e.pageY || 0;
    }
  }
  return c;
}

function tapTargetElement(e) {
  var ele = e.target;

  if(ele && ele.tagName === 'LABEL') {
    if(ele.control) return ele.control;

    // older devices do not support the "control" property
    if(ele.querySelector) {
      var control = ele.querySelector('input,textarea,select');
      if(control) return control;
    }
  }
  return ele;
}

ionic.DomUtil.ready(function(){

  ionic.tap.register(document.body);

});
