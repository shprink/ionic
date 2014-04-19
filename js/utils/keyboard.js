
/*
IONIC KEYBOARD
---------------

*/

var keyboardViewportHeight;
var keyboardIsOpen;

var DEFAULT_KEYBOARD_HEIGHT = 260;
var KEYBOARD_OPEN_CSS = 'keyboard-open'

ionic.keyboard = {
  isOpen: false,
  height: null,
  alreadyOpen: false // when switching inputs, keyboard technically opens and closes
                     // so need to check if it was already open to resize view or not
};

function keyboardInit(window) {
  keyboardViewportHeight = window.innerHeight;

  if( keyboardHasPlugin() ){
    window.addEventListener('native.showkeyboard', keyboardUpdateHeight);
  }

  window.addEventListener('ionic.focusin', keyboardElementFocusIn);
  window.addEventListener('focusout', keyboardElementFocusOut);
  window.addEventListener('orientationchange', keyboardUpdateViewportHeight);
}

function keyboardElementFocusIn(e) {
  if( !e.target || !ionic.tap.isTextInput(e.target) ) return;

  document.body.scrollTop = 0;

  var keyboardHeight = keyboardGetHeight();
  var elementBounds = e.target.getBoundingClientRect();

  keyboardShow(e.target, elementBounds.top, elementBounds.bottom, keyboardViewportHeight, keyboardHeight);
}

function keyboardElementFocusOut(e) {
  ionic.keyboard.IsOpen = false;

  // wait to see if we're just switching inputs
  setTimeout(function() {

    //keyboard still isn't open
    if(!ionic.keyboard.IsOpen) {
      keyboardHide();

      // if we change orientation when the keyboard is open, get device height
      // once keyboard closes to get the proper value
      keyboardUpdateViewportHeight();

      ionic.keyboard.alreadyOpen = false;
    }
  }, 100);
}

function keyboardUpdateViewportHeight(e) {
  if ( !ionic.keyboard.isOpen ){
    keyboardViewportHeight = window.innerHeight;
  }
}

function keyboardUpdateHeight(e){
  ionic.keyboard.height = e.keyboardHeight || DEFAULT_KEYBOARD_HEIGHT;
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

  // otherwise fall back to just guessing
  return DEFAULT_KEYBOARD_HEIGHT;
}

function keyboardShow(element, elementTop, elementBottom, viewportHeight, keyboardHeight) {
  var details = {
    target: element,
    elementTop: elementTop,
    elementBottom: elementBottom,
    keyboardHeight: keyboardHeight
  };

  if(!keyboardHeight) {
    keyboardHeight = keyboardGetHeight();
    details.keyboardHeight = keyboardHeight;
  }

  if( keyboardIsOverWebView() ) {
    // keyboard is over the view
    details.contentHeight = viewportHeight - keyboardHeight;
  } else {
    // view was resized and the keyboard takes up the space the view doesn't fill
    details.contentHeight = viewportHeight;
  }

  console.debug('keyboardShow', details.keyboardHeight, details.contentHeight);

  //distance from top of input to the top of the keyboard
  details.keyboardTopOffset = (details.elementTop - details.contentHeight);

  console.debug('keyboardTopOffset', details.elementTop, details.contentHeight, details.keyboardTopOffset);

  // figure out if the element is under the keyboard
  details.isElementUnderKeyboard = (details.elementBottom > details.contentHeight);

  console.debug('isElementUnderKeyboard', details.isElementUnderKeyboard);

  // the scrollview should resize if the keyboard isn't already open
  details.doResize = (!ionic.keyboard.alreadyOpen && details.isElementUnderKeyboard);

  // send event so the scroll view adjusts
  if(details.isElementUnderKeyboard) {
    ionic.trigger('scrollChildIntoView', details, true);
  }

  ionic.keyboard.alreadyOpen = true;
  ionic.keyboard.isOpen = true;

  ionic.requestAnimationFrame(function(){
    document.body.classList.add(KEYBOARD_OPEN_CSS);
  });

  return details;
}

function keyboardHide() {
  ionic.trigger('resetScrollView', {
    target: tapActiveElement()
  }, true);

  ionic.requestAnimationFrame(function(){
    document.body.classList.remove(KEYBOARD_OPEN_CSS);
  });
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

