
/*
IONIC KEYBOARD
---------------

*/

var keyboardDeviceWidth;
var keyboardDeviceHeight;
var keyboardActiveElement;

var DEFAULT_KEYBOARD_HEIGHT = 260;
var KEYBOARD_OPEN_CSS = 'keyboard-open'

ionic.keyboard = {
  isOpen: false
};

function keyboardInit(window) {
  keyboardDeviceWidth = window.innerWidth;
  keyboardDeviceHeight = window.innerHeight;

  window.addEventListener('focusin', keyboardElementFocusIn);

  if( keyboardHasPlugin() ) {
    window.addEventListener('native.showkeyboard', keyboardPluginShow);
    window.addEventListener('native.hidekeyboard', keyboardPluginHide);

  } else if (ionic.Platform.isAndroid()){
    window.addEventListener('resize', keyboardBrowserResize);
  }
}


function keyboardElementFocusIn(e) {
  if (ionic.tap.containsOrIsTextInput(e.target) || e.target.isContentEditable){
    document.body.scrollTop = 0;
  }

  keyboardActiveElement = e.target;

  if( !keyboardHasPlugin() ) {
    // only run this if the keyboard plugin doesn't exist
    // it will figure out a default keyboard height when sent a null keyboard height
    var elementBoundingRect = e.target.getBoundingClientRect();
    keyboardShow(e.target, elementBoundingRect.top, elementBoundingRect.bottom, keyboardDeviceHeight, null);
  }
}

function keyboardBrowserResize() {
  if(keyboardDeviceWidth !== window.innerWidth) {
    // If the width of the window changes, we have an orientation change
    keyboardDeviceWidth = window.innerWidth;
    keyboardDeviceHeight = window.innerHeight;

  } else if(keyboardDeviceHeight !== window.innerHeight &&
             window.innerHeight < keyboardDeviceHeight) {
    // If the height changes, and it's less than before, we have a keyboard open
    document.body.classList.add(KEYBOARD_OPEN_CSS);

    var keyboardHeight = keyboardDeviceHeight - window.innerHeight;
    setTimeout(function() {
      ionic.trigger('scrollChildIntoView', {
        target: keyboardActiveElement,
      }, true);
    }, 100);

  } else {
    // Otherwise we have a keyboard close or a *really* weird resize
    document.body.classList.remove(KEYBOARD_OPEN_CSS);
  }
}

function keyboardPluginShow(e) {
  if(keyboardActiveElement && cordova.plugins.Keyboard.isVisible) {

    var elementBoundingRect = e.target.getBoundingClientRect();
    keyboardShow(keyboardActiveElement, elementBoundingRect.top, elementBoundingRect.bottom, keyboardDeviceHeight, e.keyboardHeight);
  }
}

function keyboardPluginHide() {
  // wait to see if we're just switching inputs
  setTimeout(function() {
    if(!cordova.plugins.Keyboard.isVisible) {
      keyboardHide();
    }
  }, 100);
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

