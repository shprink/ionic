
/*

Physical Device Testing Scenarios
---------------------------------


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
    ionic.keyboard.isOpen(false);
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

  it('Should keyboardIsOverWebView()=true if iOS 7.0 or greater', function(){
    ionic.Platform.setPlatform('iOS');
    ionic.Platform.setVersion('7.0');
    expect( ionic.Platform.isAndroid() ).toEqual(false);
    expect( ionic.Platform.isIOS() ).toEqual(true);

    expect( keyboardIsOverWebView() ).toEqual(true);
  });

  it('Should keyboardIsOverWebView()=false if less than iOS 7.0', function(){
    ionic.Platform.setPlatform('iOS');
    ionic.Platform.setVersion('6.0');
    expect( ionic.Platform.isAndroid() ).toEqual(false);
    expect( ionic.Platform.isIOS() ).toEqual(true);

    expect( keyboardIsOverWebView() ).toEqual(false);
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
    expect( keyboardGetHeight() ).toEqual(260);
  });

  it('keyboardGetHeight() should = difference in window height before and after keyboard show if view resizes', function(){
    keyboardDeviceHeight = 460;
    window.innerHeight = 260;
    expect( keyboardGetHeight() ).toEqual(200); 
  });

  it('keyboardGetHeight() should = cordova.plugins.Keyboard.height if plugin exists', function(){
    cordova = { plugins: { Keyboard: { height: 200 } } };
    expect( keyboardGetHeight() ).toEqual(200);
  });

  it('keyboardUpdateDeviceHeight() should update when ionic.keyboard.isOpen() is false', function(){
    ionic.keyboard.isOpen(false);
    window.innerHeight = 460;
    keyboardDeviceHeight = 320;
    keyboardUpdateDeviceHeight();

    expect( keyboardDeviceHeight ).toEqual(460);
  });

  it('keyboardUpdateDeviceHeight() should not update when ionic.keyboard.isOpen() is true', function(){
    ionic.keyboard.isOpen(true);
    window.innerHeight = 100;
    keyboardDeviceHeight = 320;
    keyboardUpdateDeviceHeight();

    expect( keyboardDeviceHeight ).toEqual(320);
  });



});
