
/*
IONIC KEYBOARD
---------------

*/

var keyboardDeviceHeight;
var keyboardActiveElement;
var keyboardIsOpen;

var DEFAULT_KEYBOARD_HEIGHT = 260;
var KEYBOARD_OPEN_CSS = 'keyboard-open'

ionic.keyboard = {
  isOpen: function(value){
    if ( arguments.length ){
      keyboardIsOpen = !!value;
    }
    return keyboardIsOpen;
  }
};

function keyboardInit(window) {
  keyboardDeviceHeight = window.innerHeight;

  window.addEventListener('ionic.focusin', keyboardElementFocusIn);
  window.addEventListener('focusout', keyboardElementFocusOut);
  window.addEventListener('orientationchange', keyboardUpdateDeviceHeight);
}

function keyboardElementFocusIn(e) {
  if( !e.target || !ionic.tap.isTextInput(e.target) ) return;

  document.body.scrollTop = 0;

  keyboardActiveElement = e.target;
  var keyboardHeight = getKeyboardHeight();
  var elementBoundingRect = e.target.getBoundingClientRect();

  keyboardShow(e.target, elementBoundingRect.top, elementBoundingRect.bottom, keyboardDeviceHeight, keyboardHeight);

  document.body.classList.add(KEYBOARD_OPEN_CSS);
}

function keyboardElementFocusOut(e) {
  //wait to see if we're just switching inputs
  setTimeout(function() {
    if(ionic.keyboard.IsOpen()) {
      keyboardHide();
    }
  }, 100);
}

function keyboardUpdateDeviceHeight(e) {
  keyboardDeviceHeight = window.innerHeight;
}

function getKeyboardHeight() {
  // check if we are using the keyboard plugin
  if ( window.cordova && cordova.plugins && cordova.plugins.Keyboard 
      && cordova.plugins.Keyboard.height ){
    
    return cordova.plugins.Keyboard.height;
  }
 
  // Not using the plugin, so try and determine the height of the keyboard by
  // the difference in the window height
  if( keyboardDeviceHeight !== window.innerHeight &&
             window.innerHeight < keyboardDeviceHeight ) {

    return keyboardDeviceHeight - window.innerHeight;
  }

  // otherwise fall back to just guessing
  return DEFAULT_KEYBOARD_HEIGHT;
}

function keyboardShow(element, elementTop, elementBottom, deviceHeight, keyboardHeight) {
  var details = {
    target: element,
    elementTop: elementTop,
    elementBottom: elementBottom,
    firstKeyboardShow: !ionic.keyboard.isOpen
  };

  if(!keyboardHeight || keyboardHeight < 100) {
    // given a unknown or bad keyboard height, use a default
    keyboardHeight = keyboardDefaultHeight();
  }
  details.keyboardHeight = keyboardHeight;

  if( keyboardIsOverWebView() ) {
    // keyboard is over the view
    details.frameHeight = deviceHeight - keyboardHeight;
  } else {
    // view was resized and the keyboard takes up the space the view doesn't fill
    details.frameHeight = deviceHeight;
  }

  //distance from top of input to the top of the keyboard
  details.keyboardTopOffset = (details.elementTop - details.frameHeight);

  // figure out if the element is under the keyboard
  details.isElementUnderKeyboard = (details.elementDeviceBottom > details.frameHeight);

  // the scrollview should resize if the keyboard isn't already open
  details.doResize = (!ionic.keyboard.isOpen && details.isElementUnderKeyboard);

  // send event so the scroll view adjusts
  if(details.isElementUnderKeyboard) {
    ionic.trigger('scrollChildIntoView', details, true);
  }

  if(!ionic.keyboard.isOpen) ionic.keyboard.isOpen = true;

  ionic.requestAnimationFrame(function(){
    document.body.classList.add(KEYBOARD_OPEN_CSS);
  });

  return details;
}

function keyboardHide() {
  ionic.keyboard.isOpen = false;
  ionic.trigger('resetScrollView', {
    target: keyboardActiveElement
  }, true);

  ionic.requestAnimationFrame(function(){
    document.body.classList.remove(KEYBOARD_OPEN_CSS);
  });
}

function keyboardIsOverWebView() {
  return ( ionic.Platform.isIOS() && ionic.Platform.version() >= 7.0 ) ||
         ( !ionic.Platform.isWebView() && ionic.Platform.isAndroid() );
}

function keyboardHasPlugin() {
  return !!(window.cordova && cordova.plugins && cordova.plugins.Keyboard);
}

function keyboardDefaultHeight() {
  return DEFAULT_KEYBOARD_HEIGHT;
}

ionic.Platform.ready(function() {
  keyboardInit(window);
});

