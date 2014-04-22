
/*
IONIC KEYBOARD
---------------

*/

var keyboardViewportHeight = window.innerHeight;
var keyboardIsOpen;
var keyboardActiveElement;
var keyboardResetTimer;
var keyboardFocusInTimer;

var DEFAULT_KEYBOARD_HEIGHT = 275;
var KEYBOARD_OPEN_CSS = 'keyboard-open';
var SCROLL_CONTAINER_CSS = 'scroll';

ionic.keyboard = {
  isOpen: false,
  height: null
};

function keyboardInit() {
  if( keyboardHasPlugin() ) {
    window.addEventListener('native.showkeyboard', keyboardNativeShow);
  }
  window.addEventListener('ionic.focusin', keyboardBrowserFocusIn);
  window.addEventListener('focusin', keyboardBrowserFocusIn);

  window.addEventListener('focusout', keyboardFocusOut);
  window.addEventListener('orientationchange', keyboardOrientationChange);

  document.removeEventListener('touchstart', keyboardInit);
}

function keyboardNativeShow(e) {
  ionic.keyboard.height = e.keyboardHeight;
  keyboardSetShow(keyboardActiveElement);
}

function keyboardBrowserFocusIn(e) {
  if( !e.target || !ionic.tap.isTextInput(e.target) || !keyboardIsWithinScroll(e.target) ) return;
  document.body.scrollTop = 0;
  keyboardActiveElement = e.target;

  if ( !keyboardHasPlugin() ) {
    clearTimeout(keyboardFocusInTimer);
    keyboardFocusInTimer = setTimeout(function(){
      keyboardSetShow(keyboardActiveElement);
    }, 32);
  }
}

function keyboardSetShow(element) {
  var keyboardHeight = keyboardGetHeight();
  var elementBounds = element.getBoundingClientRect();

  keyboardShow(element, elementBounds.top, elementBounds.bottom, keyboardViewportHeight, keyboardHeight);
}

function keyboardShow(element, elementTop, elementBottom, viewportHeight, keyboardHeight) {
  var details = {
    target: element,
    elementTop: elementTop,
    elementBottom: elementBottom,
    keyboardHeight: keyboardHeight
  };

  console.debug('innerHeight', window.innerHeight);
  console.debug('viewportHeight', viewportHeight);

  if( window.innerHeight < viewportHeight ) {
    // view's height was shrunk down and the keyboard takes up the space the view doesn't fill
    // do not add extra padding at the bottom of the scroll view, native already did that
    details.contentHeight = window.innerHeight;
  } else {
    // keyboard sits on top of the view, but doesn't adjust the view's height
    // lower the content height by subtracting the keyboard height from the view height
    details.contentHeight = viewportHeight - keyboardHeight;
  }

  console.debug('keyboardShow', keyboardHeight, details.contentHeight);

  // distance from top of input to the top of the keyboard
  details.keyboardTopOffset = Math.round(details.elementTop - details.contentHeight);

  console.debug('keyboardTopOffset', details.elementTop, details.contentHeight, details.keyboardTopOffset);

  // figure out if the element is under the keyboard
  details.isElementUnderKeyboard = (details.elementBottom > details.contentHeight);

  clearTimeout(keyboardResetTimer);
  ionic.keyboard.isOpen = true;

  // send event so the scroll view adjusts
  keyboardActiveElement = element;
  ionic.trigger('scrollChildIntoView', details, true);

  ionic.requestAnimationFrame(function(){
    document.body.classList.add(KEYBOARD_OPEN_CSS);
  });

  // any showing part of the document that isn't within the scroll the user
  // could touchmove and cause some ugly changes to the app, so disable
  // any touchmove events while the keyboard is open using e.preventDefault()
  document.addEventListener('touchmove', keyboardDisableNativeScroll, false);

  return details;
}

function keyboardFocusOut(e) {
  // wait to see if we're just switching inputs
  clearTimeout(keyboardResetTimer);
  keyboardResetTimer = setTimeout(function() {
    keyboardHide();

    // if we change orientation when the keyboard is open, get device height
    // once keyboard closes to get the proper value
    keyboardUpdateViewportHeight();

    ionic.keyboard.isOpen = false;
  }, 400);
}

function keyboardHide() {
  console.debug('keyboardHide');
  ionic.trigger('resetScrollView', {
    target: keyboardActiveElement
  }, true);

  ionic.requestAnimationFrame(function(){
    document.body.classList.remove(KEYBOARD_OPEN_CSS);
  });

  // the keyboard is gone now, remove the touchmove that disables native scroll
  document.removeEventListener('touchmove', keyboardDisableNativeScroll);
}

function keyboardUpdateViewportHeight() {
  if( window.innerHeight > keyboardViewportHeight ) {
    keyboardViewportHeight = window.innerHeight;
  }
}

function keyboardOrientationChange() {
  keyboardViewportHeight = window.innerHeight;
  setTimeout(function(){
    keyboardViewportHeight = window.innerHeight;
  }, 1000);
}

function keyboardGetHeight() {
  // check if we are already have a keyboard height from the plugin
  if (ionic.keyboard.height ) {
    return ionic.keyboard.height;
  }

  // Not using the plugin, so try and determine the height of the keyboard by
  // the difference in window height
  if( window.innerHeight < keyboardViewportHeight ) {

    ionic.keyboard.height = keyboardViewportHeight - window.innerHeight;

    return ionic.keyboard.height;
  }

  if( ionic.Platform.isIOS() ) {
    if( ionic.Platform.isWebView() ) {
      return 200;
    }
    return 220;
  }

  // otherwise fall back to just guessing
  return DEFAULT_KEYBOARD_HEIGHT;
}

function keyboardDisableNativeScroll(e) {
  e.preventDefault();
}

function keyboardIsWithinScroll(ele) {
  while(ele) {
    if(ele.classList.contains(SCROLL_CONTAINER_CSS)) {
      return true;
    }
    ele = ele.parentElement;
  }
  return false;
}

function keyboardIsOverWebView() {
  return ( ionic.Platform.isIOS() ) ||
         ( !ionic.Platform.isWebView() && ionic.Platform.isAndroid() );
}

function keyboardHasPlugin() {
  return !!(window.cordova && cordova.plugins && cordova.plugins.Keyboard);
}

ionic.Platform.ready(function() {
  keyboardUpdateViewportHeight();

  // Android sometimes reports bad innerHeight on window.load
  // try it again in a lil bit to play it safe
  setTimeout(keyboardUpdateViewportHeight, 1000);

  // only initialize the adjustments for the virtual keyboard
  // if a touchstart event happens
  //document.addEventListener('touchstart', keyboardInit, false);
  keyboardInit();

});

