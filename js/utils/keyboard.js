
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
  isOpen: false,
  height: null, 
  alreadyOpen: false // when switching inputs, keyboard technically opens and closes
                     // so need to check if it was already open to resize view or not
};

function keyboardInit(window) {
  keyboardDeviceHeight = window.innerHeight;

  if( keyboardHasPlugin() ){
    window.addEventListener('native.showkeyboard', keyboardUpdateHeight);
  }

  window.addEventListener('ionic.focusin', keyboardElementFocusIn);
  window.addEventListener('focusout', keyboardElementFocusOut);
  window.addEventListener('orientationchange', keyboardUpdateDeviceHeight);
}

function keyboardElementFocusIn(e) {
  if( !e.target || !ionic.tap.isTextInput(e.target) ) return;

  document.body.scrollTop = 0;

  keyboardActiveElement = e.target;
  var keyboardHeight = keyboardGetHeight(); 
  var elementBoundingRect = e.target.getBoundingClientRect();

  keyboardShow(e.target, elementBoundingRect.top, elementBoundingRect.bottom, keyboardDeviceHeight, keyboardHeight);
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
      keyboardUpdateDeviceHeight();

      ionic.keyboard.alreadyOpen = false;
    }
  }, 100);
}

function keyboardUpdateDeviceHeight(e) {
  if ( !ionic.keyboard.isOpen ){
    keyboardDeviceHeight = window.innerHeight; 
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
  if( keyboardDeviceHeight !== window.innerHeight &&
             window.innerHeight < keyboardDeviceHeight ) {

    ionic.keyboard.height = keyboardDeviceHeight - window.innerHeight;

    return ionic.keyboard.height;
  }

  //for whatever reason window size has not changed, use old value
  if (ionic.keyboard.height !== null) return ionic.keyboard.height;

  // otherwise fall back to just guessing
  return DEFAULT_KEYBOARD_HEIGHT;
}

function keyboardShow(element, elementTop, elementBottom, deviceHeight, keyboardHeight) {
  var details = {
    target: element,
    elementTop: elementTop,
    elementBottom: elementBottom,
    firstKeyboardShow: !ionic.keyboard.alreadyOpen,
    keyboardHeight: keyboardHeight
  };

  if(!keyboardHeight) {
    keyboardHeight = keyboardGetHeight(); 
    details.keyboardHeight = keyboardHeight;
  }

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
  details.isElementUnderKeyboard = (details.elementBottom > details.frameHeight);

  // the scrollview should resize if the keyboard isn't already open
  details.doResize = (!ionic.keyboard.alreadyOpen && details.isElementUnderKeyboard);
 
  // send event so the scroll view adjusts
  if(details.isElementUnderKeyboard) {
    ionic.trigger('scrollChildIntoView', details, true);
  }

  if(!ionic.keyboard.alreadyOpen) ionic.keyboard.alreadyOpen = true;
  if(!ionic.keyboard.isOpen) ionic.keyboard.isOpen = true;

  ionic.requestAnimationFrame(function(){
    document.body.classList.add(KEYBOARD_OPEN_CSS);
  });

  return details;
}

function keyboardHide() {
  ionic.trigger('resetScrollView', {
    target: keyboardActiveElement
  }, true);

  ionic.requestAnimationFrame(function(){
    document.body.classList.remove(KEYBOARD_OPEN_CSS);
  });
}

function keyboardIsOverWebView() {
  return ( ionic.Platform.isIOS() && ionic.Platform.version() < 7.0 ) ||
         ( !ionic.Platform.isWebView() && ionic.Platform.isAndroid() );
}

function keyboardHasPlugin() {
  return !!(window.cordova && cordova.plugins && cordova.plugins.Keyboard);
}

ionic.Platform.ready(function() {
  keyboardInit(window);
});

