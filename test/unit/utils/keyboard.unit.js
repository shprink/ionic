
/*

Physical Device Testing Scenarios
---------------------------------
- focusing inputs below the keyboard should scroll them into the middle of the view
- focusing inputs that are above the keyboard should not do anything
- focusing inputs should resize the scroll view so the user can scroll to inputs at the bottom of the page
- clicking the label of an input should focus that input
- focusing an input that is mostly offscreen should scroll into view using js scrolling, not the browser scrolling it into view
- focusing an input while another input already has focus should not (visibly) close and re-open the keyboard
- focusing an input that is above the keyboard while another input already has focus should not do anything
- focusing an input that is below the keyboard while another input already has focus should scroll it into view
- the header should not move when an input is focused
- focusing inputs at the bottom of the page should scroll into view normally (broken on iOS 7.0 w/o height meta tag)
- entering an input on a popup or modal should resize and un-resize that scrollview
- opening a popup or a modal while the keyboard is up should un-resize the scrollview before opening the modal or popup
- changing the orientation of the device should not break any of the above^

Tentative:
- height=device-height not needed on iOS 6.1
- height=device-height needed on iOS 7.0 Cordova
  ** without it, fires 4 resize events when the keyboard comes up, and the scroll view resizes incorrectly, with it, does not fire resize events? **
- height=device-height not needed on iOS 7.1


Tested On
-----------------------
- iOS 6.1 Safari
- iOS 6.1 Cordova
- iOS 7.0 Safari
- iOS 7.0 Cordova
- iOS 7.1 Safari
- iOS 7.1 Cordova
- Android 4.2 Browser
- Android 4.2 Corodva
- Android 4.4 Browser
- Android 4.4 Corodva


Notes:
---------------------------------
iOS 7 keyboard is 216px tall without the accessory bar
iOS 7 keyboard is 260px tall with the accessory bar

*/


describe('Ionic Keyboard', function() {
  var window;

  beforeEach(inject(function($window) {
    window = $window;
    window._setTimeout = window.setTimeout;
    window.setTimeout = function(){};
    _activeElement = null; // the element which has focus
    window.cordova = undefined;
    window.device = undefined;
    ionic.Platform.ua = '';
    ionic.Platform.platforms = null;
    ionic.Platform.setPlatform('');
    ionic.Platform.setVersion('');
    ionic.keyboard.isOpen = false;
  }));

  afterEach(function(){
    window.setTimeout = window._setTimeout;
  });

  it('Should keyboardShow', function(){
    var element = document.createElement('textarea');
    var elementTop = 100;
    var elementBottom = 200;
    var keyboardHeight = 200;
    var deviceHeight = 500;
    var details = keyboardShow(element, elementTop, elementBottom, deviceHeight, keyboardHeight);

    expect( details.keyboardHeight ).toEqual(200);
  });

  it('Should keyboardIsOverWebView()=false if Android and not isWebView', function(){
    ionic.Platform.setPlatform('Android');
    expect( ionic.Platform.isAndroid() ).toEqual(true);
    expect( ionic.Platform.isWebView() ).toEqual(false);

    expect( ionic.Platform.isIOS() ).toEqual(false);

    expect( keyboardIsOverWebView() ).toEqual(true);
  });

  xit('Should keyboardIsOverWebView()=false if iOS 7.0 or greater', function(){
    ionic.Platform.setPlatform('iOS');
    ionic.Platform.setVersion('7.0');
    expect( ionic.Platform.isAndroid() ).toEqual(false);
    expect( ionic.Platform.isIOS() ).toEqual(true);

    expect( keyboardIsOverWebView() ).toEqual(false);
  });

  it('Should keyboardIsOverWebView()=true if less than iOS 7.0', function(){
    ionic.Platform.setPlatform('iOS');
    ionic.Platform.setVersion('6.0');
    expect( ionic.Platform.isAndroid() ).toEqual(false);
    expect( ionic.Platform.isIOS() ).toEqual(true);

    expect( keyboardIsOverWebView() ).toEqual(true);
  });

  it('Should keyboardHasPlugin', function() {
    expect( keyboardHasPlugin() ).toEqual(false);

    window.cordova = {};
    expect( keyboardHasPlugin() ).toEqual(false);

    window.cordova.plugins = {};
    expect( keyboardHasPlugin() ).toEqual(false);

    window.cordova.plugins.Keyboard = {};
    expect( keyboardHasPlugin() ).toEqual(true);
  });

  it('keyboardGetHeight() should = DEFAULT_KEYBOARD_HEIGHT if no plugin or resized view', function(){
    expect( keyboardGetHeight() ).toEqual(275);
  });

  it('keyboardGetHeight() should = difference in window height before and after keyboard show if view resizes', function(){
    keyboardViewportHeight = 460;
    window.innerHeight = 260;
    expect( keyboardGetHeight() ).toEqual(200);
  });

  it('keyboardGetHeight() should = cordova.plugins.Keyboard.height if plugin exists', function(){
    cordova = { plugins: { Keyboard: { height: 200 } } };
    expect( keyboardGetHeight() ).toEqual(200);
  });

  it('keyboardUpdateViewportHeight() should update when ionic.keyboard.isOpen() is false', function(){
    ionic.keyboard.isOpen = false;
    window.innerHeight = 460;
    keyboardViewportHeight = 320;
    keyboardUpdateViewportHeight();

    expect( keyboardViewportHeight ).toEqual(460);
  });

  it('keyboardUpdateViewportHeight() should not update when ionic.keyboard.isOpen() is true', function(){
    ionic.keyboard.isOpen = true;
    window.innerHeight = 100;
    keyboardViewportHeight = 320;
    keyboardUpdateViewportHeight();

    expect( keyboardViewportHeight ).toEqual(320);
  });

  it('Should scroll input into view if it is under the keyboard', function(){
    var element = document.createElement('textarea');
    var elementTop = 300;
    var elementBottom = 400;
    var keyboardHeight = 200;
    window.innerHeight = 500;
    var deviceHeight = 500;
    var details = keyboardShow(element, elementTop, elementBottom, deviceHeight, keyboardHeight);

    expect( details.isElementUnderKeyboard ).toEqual(true);
  });

  it('Should not scroll input into view if it is not under the keyboard', function(){
    var element = document.createElement('textarea');
    var elementTop = 100;
    var elementBottom = 200;
    var keyboardHeight = 200;
    window.innerHeight = 500;
    var deviceHeight = 500;
    var details = keyboardShow(element, elementTop, elementBottom, deviceHeight, keyboardHeight);

    expect( details.isElementUnderKeyboard ).toEqual(false);
  });

  it('Should not subtract the keyboard height from the contentHeight if window.innerHeight < viewportHeight', function(){
    var element = document.createElement('textarea');
    var elementTop = 300;
    var elementBottom = 400;
    var keyboardHeight = 200;

    var deviceHeight = 460;
    window.innerHeight = 260;
    var details = keyboardShow(element, elementTop, elementBottom, deviceHeight, keyboardHeight);

    expect( details.contentHeight ).toEqual(260);
  });

  it('Should subtract the keyboard height from the contentHeight if window.innerHeight >= viewportHeight', function(){
    var element = document.createElement('textarea');
    var elementTop = 300;
    var elementBottom = 400;
    var keyboardHeight = 200;

    var deviceHeight = 568;
    window.innerHeight = 568;
    var details = keyboardShow(element, elementTop, elementBottom, deviceHeight, keyboardHeight);

    expect( details.contentHeight ).toEqual(368);
  });

});
