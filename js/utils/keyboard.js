
/*
IONIC KEYBOARD
---------------

*/

var keyboardViewportHeight;
var keyboardIsOpen;
var keyboardActiveElement;
var keyboardResetTimer;
var keyboardFocusInTimer;

var DEFAULT_KEYBOARD_HEIGHT = 260;
var KEYBOARD_OPEN_CSS = 'keyboard-open'

ionic.keyboard = {
  isOpen: false,
  height: null
};

function keyboardInit(window) {
  keyboardUpdateViewportHeight();

  if( keyboardHasPlugin() ) {
    window.addEventListener('native.showkeyboard', keyboardNativeShow);
  } else {
    window.addEventListener('ionic.focusin', keyboardBrowserFocusIn);
    window.addEventListener('focusin', keyboardBrowserFocusIn);
  }

  window.addEventListener('focusout', keyboardFocusOut);
  window.addEventListener('orientationchange', keyboardUpdateViewportHeight);
}

function keyboardNativeShow(e) {
  ionic.keyboard.height = e.keyboardHeight;
  keyboardSetShow(e);
}

function keyboardBrowserFocusIn(e) {
  if( !e.target || !ionic.tap.isTextInput(e.target) ) return;
  document.body.scrollTop = 0;
  clearTimeout(keyboardFocusInTimer);
  keyboardFocusInTimer = setTimeout(function(){
    keyboardSetShow(e);
  }, 20);
}

function keyboardSetShow(e) {
  document.body.scrollTop = 0;
  var keyboardHeight = keyboardGetHeight();
  var elementBounds = e.target.getBoundingClientRect();

  keyboardShow(e.target, elementBounds.top, elementBounds.bottom, keyboardViewportHeight, keyboardHeight);
}

function keyboardShow(element, elementTop, elementBottom, viewportHeight, keyboardHeight) {
  var details = {
    target: element,
    elementTop: elementTop,
    elementBottom: elementBottom,
    keyboardHeight: keyboardHeight
  }

  if( keyboardIsOverWebView() ) {
    // keyboard is over the view
    details.contentHeight = viewportHeight - keyboardHeight;
  } else {
    // view was resized and the keyboard takes up the space the view doesn't fill
    details.contentHeight = viewportHeight;
  }

  console.debug('keyboardShow', keyboardHeight, details.contentHeight);

  //distance from top of input to the top of the keyboard
  details.keyboardTopOffset = (details.elementTop - details.contentHeight);

  console.debug('keyboardTopOffset', details.elementTop, details.contentHeight, details.keyboardTopOffset);

  // figure out if the element is under the keyboard
  details.isElementUnderKeyboard = (details.elementBottom > details.contentHeight);

  // the scrollview should resize if the keyboard isn't already open
  details.doResize = (!ionic.keyboard.isOpen);

  clearTimeout(keyboardResetTimer);
  ionic.keyboard.isOpen = true;

  // send event so the scroll view adjusts
  keyboardActiveElement = element;
  ionic.trigger('scrollChildIntoView', details, true);

  ionic.requestAnimationFrame(function(){
    document.body.classList.add(KEYBOARD_OPEN_CSS);
  });

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

    ionic.keyboard.IsOpen = false;
  }, 1000);
}

function keyboardHide() {
  console.debug('keyboardHide')
  ionic.trigger('resetScrollView', {
    target: keyboardActiveElement
  }, true);

  ionic.requestAnimationFrame(function(){
    document.body.classList.remove(KEYBOARD_OPEN_CSS);
  });
}

function keyboardUpdateViewportHeight(e) {
  if ( !ionic.keyboard.isOpen ) keyboardViewportHeight = window.innerHeight;
}

function keyboardGetHeight() {
  // check if we are using the keyboard plugin
  if ( keyboardHasPlugin() ){
    return ionic.keyboard.height;
  }

  // Not using the plugin, so try and determine the height of the keyboard by
  // the difference in window height
  if( keyboardViewportHeight !== window.innerHeight &&
      window.innerHeight < keyboardViewportHeight ) {

    ionic.keyboard.height = keyboardViewportHeight - window.innerHeight;

    return ionic.keyboard.height;
  }

  //for whatever reason window size has not changed, use old value
  if (ionic.keyboard.height !== null) return ionic.keyboard.height;

  if( !ionic.Platform.isWebView() ) {
    if( ionic.Platform.isIOS() ) {
      return 220;
    }
  }

  // otherwise fall back to just guessing
  return DEFAULT_KEYBOARD_HEIGHT;
}

function keyboardIsOverWebView() {
  return ( ionic.Platform.isIOS() ) ||
         ( !ionic.Platform.isWebView() && ionic.Platform.isAndroid() );
}

function keyboardHasPlugin() {
  return !!(window.cordova && cordova.plugins && cordova.plugins.Keyboard);
}

ionic.Platform.ready(function() {
  keyboardInit(window);
});

