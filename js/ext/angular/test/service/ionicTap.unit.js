window.console.debug = function(){};

describe('Ionic Tap', function() {
  var deregisterTap;

  beforeEach(function() {
    window._setTimeout = window.setTimeout;
    window.setTimeout = function(){};
    _activeElement = null; // the element which has focus

    deregisterTap = ionic.tap.register(document.createElement('div'));
  });

  afterEach(function(){
    window.setTimeout = window._setTimeout;
    deregisterTap();
  });

  /*

  Physical Device Testing Scenarios
  ---------------------------------
  - Keyboard should show up when tapping on a text input
  - Keyboard should show up when tapping on a label which surrounds a text input
  - Keyboard should go away when text input is focused, then tapped outside of input
  - Keyboard should hide when tapping the virtual keyboard's "Done" or down arrow, but tapping
    the input again will bring up the keyboard again
  - Options dialog should show when tapping on a select
  - Options dialog should show when tapping on a label which surrounds a select (not working in Android 2.3)
  - Tapping a button element should fire one click
  - Tapping an anchor element should fire one click
  - Tapping a checkbox should fire one click
  - Tapping a label which surrounds a checkbox should fire one click
  - Tapping a radio button should fire one click
  - Tapping a label which surrounds a radio button should fire one click
  - Moving an input[range] slider should work
  - Tapping the track on an input[range] slider should move the knob to that location (not a default in iOS)
  - Tapping an input[file] should bring up the file dialog
  - After tapping an input[file] and closing the input file dialog, tap a different
    element and the file dialog should NOT show up
  - Element which is disabled should not be clicked
  - Holding a touchstart, and not moving, should fire the click no matter how long the hold
  - Holding a mousedown, and not moving, should fire the click no matter how long the hold
  - Holding touchstart, then moving a few pixels cancels the click
  - Holding mousedown, then moving a few pixels cancels the click
  - Touchstart should set and remove the activated css class
  - Mousedown should set and remove the activated css class
  - Holding touchstart, then moving a few pixels removes the activated css class
  - Holding mousedown, then moving a few pixels removes the activated css class
  - An element or one of its parents with data-tap-disabled attribute should still click, but w/ a delay
  - ALL THE ABOVE, BUT NOW WITH NG-CLICK ON THE INPUT!
  - Tapping a div with an click event added should fire one click

  Tested on:
  ----------------------------
  - iOS6 iPad 3
  - iOS7 iPhone 5

  */

  it('Should trigger a labels child inputs click, but stop the labels end event', function() {
    var startEvent = {
      type: 'touchstart',
      target: {
        tagName: 'LABEL',
        dispatchEvent: function() { startEvent.target.dispatchedEvent = true },
        focus: function() { startEvent.target.focused = true },
        control: {
          tagName: 'INPUT',
          dispatchEvent: function() { startEvent.target.control.dispatchedEvent = true },
          focus: function() { startEvent.target.control.focused = true },
        }
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };
    var endEvent = {
      type: 'touchend',
      target: {
        tagName: 'LABEL',
        dispatchEvent: function() { startEvent.target.dispatchedEvent = true },
        focus: function() { startEvent.target.focused = true },
        control: {
          tagName: 'INPUT',
          dispatchEvent: function() { startEvent.target.control.dispatchedEvent = true },
          focus: function() { startEvent.target.control.focused = true },
        }
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };

    tapClick(startEvent, endEvent);

    expect( startEvent.target.dispatchedEvent ).toBeUndefined();
    expect( startEvent.target.focused ).toBeUndefined();

    expect( startEvent.target.control.dispatchedEvent ).toBeDefined();
    expect( startEvent.target.control.focused ).toBeDefined();

    expect( endEvent.stoppedPropagation ).toBeUndefined();
    expect( endEvent.preventedDefault ).toBeDefined();
  });

  it('Should trigger a click for an element w/out a wrapping label', function() {
    var startEvent = {
      type: 'touchstart',
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { startEvent.target.dispatchedEvent = true },
        focus: function() { startEvent.target.focused = true },
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };
    var endEvent = {
      type: 'touchend',
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { startEvent.target.dispatchedEvent = true },
        focus: function() { startEvent.target.focused = true },
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };

    tapClick(startEvent, endEvent);

    expect( startEvent.target.dispatchedEvent ).toBeDefined();
    expect( startEvent.target.focused ).toBeDefined();

    expect( endEvent.stoppedPropagation ).toBeUndefined();
    expect( endEvent.preventedDefault ).toBeUndefined();

  });

  it('Should not trigger a click if tapPointerMoved has moved', function() {
    var startEvent = {
      type: 'touchstart',
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { startEvent.target.dispatchedEvent = true },
        focus: function() { startEvent.target.focused = true },
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };
    var endEvent = {
      type: 'touchend',
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { startEvent.target.dispatchedEvent = true },
        focus: function() { startEvent.target.focused = true },
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };

    tapPointerMoved = true;
    expect( tapClick(startEvent, endEvent) ).toEqual(false);

  });

  it('Should set tapMouseDownEvent on mousedown', function() {
    expect(tapMouseDownEvent).toEqual(null);
    var e = { type: 'mousedown' };
    tapMouseDown(e);
    expect(tapMouseDownEvent).toBe(e);
  });

  it('Should null tapMouseDownEvent on mouseup', function() {
    var target = {
      tagName: 'INPUT',
      dispatchEvent: function() { target.dispatchedEvent = true },
      focus: function() { target.focused = true },
      blur: function() { target.blurred = true }
    };
    var e = { type: 'mousedown', target: target };
    tapMouseDown(e);
    expect(tapMouseDownEvent).toBe(e);
    tapMouseUp({ type: 'mouseup', target: target });
    expect(tapMouseDownEvent).toBe(null);
  });

  it('Should trigger click on mouseup and when nearby mousedown happened', function() {
    var startEvent = {
      type: 'mousedown',
      clientX: 100, clientY: 100,
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { startEvent.target.dispatchedEvent = true },
        focus: function() { startEvent.target.focused = true },
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };
    var endEvent = {
      type: 'mouseup',
      clientX: 101, clientY: 101,
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { startEvent.target.dispatchedEvent = true },
        focus: function() { startEvent.target.focused = true },
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };

    expect( startEvent.target.dispatchedEvent ).toBeUndefined();

    tapMouseDown(startEvent);
    expect(tapMouseDownEvent).toBe(startEvent);
    tapMouseUp(endEvent);

    expect( startEvent.target.dispatchedEvent ).toBeDefined();
    expect(tapMouseDownEvent).toBe(null);
  });

  it('Should not trigger click on mouseup because mousedown coordinates too far away', function() {
    var startEvent = {
      type: 'mousedown',
      clientX: 100, clientY: 100,
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { startEvent.target.dispatchedEvent = true },
        focus: function() { startEvent.target.focused = true },
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };
    var endEvent = {
      type: 'mouseup',
      clientX: 200, clientY: 200,
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };

    expect( startEvent.target.dispatchedEvent ).toBeUndefined();

    tapMouseDown(startEvent);
    expect(tapMouseDownEvent).toBe(startEvent);
    tapMouseUp(endEvent);

    expect( startEvent.target.dispatchedEvent ).toBeUndefined();
    expect(tapMouseDownEvent).toBe(null);
  });

  it('Should set tapHasPointerMoved=false on tapTouchStart', function() {
    tapPointerMoved = null;
    tapTouchStart({});
    expect( tapPointerMoved ).toEqual(false);
  });

  it('Should set tapPointerMoved=false on tapTouchCancel', function() {
    tapPointerMoved = true;
    tapTouchCancel();
    expect( tapPointerMoved ).toEqual(false);
  });

  it('Should set tapHasPointerMoved=true on tapTouchMove', function() {
    tapPointerMoved = null;
    tapTouchStart({ clientX: 100, clientY: 100 });
    expect( tapPointerMoved ).toEqual(false);
    tapTouchMove({ clientX: 200, clientY: 100 });
    expect( tapPointerMoved ).toEqual(true);
  });

  it('Should set tapHasPointerMoved=false on tapMouseDown', function() {
    tapPointerMoved = null;
    tapMouseDown({});
    expect( tapPointerMoved ).toEqual(false);
  });

  it('Should set tapPointerMoved=false on tapMouseUp', function() {
    tapPointerMoved = true;
    tapMouseUp({});
    expect( tapPointerMoved ).toEqual(false);
  });

  it('Should set tapHasPointerMoved=true on tapMouseMove', function() {
    tapPointerMoved = null;
    tapMouseDown({ clientX: 100, clientY: 100 });
    expect( tapPointerMoved ).toEqual(false);
    tapMouseMove({ clientX: 200, clientY: 100 });
    expect( tapPointerMoved ).toEqual(true);
  });

  it('Should set tapTouchStartEvent on touchstart', function() {
    expect(tapTouchStartEvent).toEqual(null);
    var e = { type: 'touchstart' };
    tapTouchStart(e);
    expect(tapTouchStartEvent).toBe(e);
  });

  it('Should null tapTouchStartEvent on touchend', function() {
    var target = {
      tagName: 'INPUT',
      dispatchEvent: function() { target.dispatchedEvent = true },
      focus: function() { target.focused = true },
      blur: function() { target.blurred = true }
    };
    var e = { type: 'touchstart', target: target };
    tapTouchStart(e);
    expect(tapTouchStartEvent).toBe(e);
    tapTouchEnd({ type: 'touchend', target: target });
    expect(tapTouchStartEvent).toBe(null);
  });

  it('Should trigger click on touchend and nearby touchstart happened', function() {
    var startEvent = {
      type: 'touchstart',
      clientX: 100, clientY: 100,
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { startEvent.target.dispatchedEvent = true },
        focus: function() { startEvent.target.focused = true },
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };
    var endEvent = {
      type: 'touchend',
      clientX: 101, clientY: 101,
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { startEvent.target.dispatchedEvent = true },
        focus: function() { startEvent.target.focused = true },
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };

    expect( startEvent.target.dispatchedEvent ).toBeUndefined();

    tapTouchStart(startEvent);
    expect(tapTouchStartEvent).toBe(startEvent);
    tapTouchEnd(endEvent);

    expect( startEvent.target.dispatchedEvent ).toBeDefined();
    expect(tapTouchStartEvent).toBe(null);
  });

  it('Should not trigger click on touchend because touchstart coordinates too far away', function() {
    var startEvent = {
      type: 'touchstart',
      clientX: 100, clientY: 100,
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { startEvent.target.dispatchedEvent = true },
        focus: function() { startEvent.target.focused = true },
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };
    var endEvent = {
      type: 'touchend',
      clientX: 201, clientY: 201,
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };

    expect( startEvent.target.dispatchedEvent ).toBeUndefined();

    tapTouchStart(startEvent);
    expect(tapTouchStartEvent).toBe(startEvent);
    tapTouchEnd(endEvent);

    expect( startEvent.target.dispatchedEvent ).toBeUndefined();
    expect(tapTouchStartEvent).toBe(null);
  });

  it('Should still trigger click on mouseup without a mousedown', function() {
    var endEvent = {
      type: 'mouseup',
      clientX: 100, clientY: 100,
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { endEvent.target.dispatchedEvent = true },
        focus: function() { endEvent.target.focused = true },
      },
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };
    tapMouseUp(endEvent);
    expect(endEvent.target.dispatchedEvent).toBeDefined();
    expect(tapMouseDownEvent).toBe(null);
  });

  it('Should still trigger click on touchend without a touchstart', function() {
    var endEvent = {
      type: 'touchend',
      target: {
        tagName: 'INPUT',
        dispatchEvent: function() { endEvent.target.dispatchedEvent = true },
        focus: function() { endEvent.target.focused = true },
      },
      clientX: 201, clientY: 201,
      stopPropagation: function() { endEvent.stoppedPropagation = true },
      preventDefault: function() { endEvent.preventedDefault = true }
    };
    tapTouchEnd(endEvent);
    expect(endEvent.target.dispatchedEvent).toBeDefined();
    expect(tapTouchStartEvent).toBe(null);
  });

  it('Should tapEnabledTouchEvents because of touchstart', function() {
    tapEnabledTouchEvents = false;
    tapTouchStart({});
    tapEnabledTouchEvents = true;
  });

  it('Should cancel click on touchcancel', function() {
    tapTouchStartEvent = {};
    tapTouchCancel({});
    expect(tapTouchStartEvent).toBe(null);
  });

  it('Should cancel click when touchmove coordinates goes too far from touchstart coordinates', function() {
    var startEvent = { clientX: 100, clientY: 100 };
    tapTouchStart(startEvent);

    expect( tapTouchMove({ clientX: 102, clientY: 100 }) ).toBeUndefined();

    expect( tapTouchMove({ clientX: 105, clientY: 100 }) ).toBeUndefined();

    expect( tapTouchMove({ clientX: 200, clientY: 100 }) ).toEqual(false);
  });

  it('Should cancel click when touchend coordinates are too far from touchstart coordinates', function() {
    var startEvent = { clientX: 100, clientY: 100 };
    tapTouchStart(startEvent);
    expect(tapTouchStartEvent).toBe(startEvent);

    tapTouchEnd({ clientX: 200, clientY: 100 })
    expect(tapTouchStartEvent).toBe(null);
  });

  it('Should cancel click when mousemove coordinates goes too far from mousedown coordinates', function() {
    var startEvent = { clientX: 100, clientY: 100 };
    tapMouseDown(startEvent);

    expect( tapMouseMove({ clientX: 102, clientY: 100 }) ).toBeUndefined();

    expect( tapMouseMove({ clientX: 105, clientY: 100 }) ).toBeUndefined();

    expect( tapMouseMove({ clientX: 200, clientY: 100 }) ).toEqual(false);
  });

  it('Should cancel click when mouseup coordinates are too far from mousedown coordinates', function() {
    var startEvent = { clientX: 100, clientY: 100 };
    tapMouseDown(startEvent);
    expect(tapMouseDownEvent).toBe(startEvent);

    tapMouseUp({ clientX: 200, clientY: 100 })
    expect(tapMouseDownEvent).toBe(null);
  });

  it('Should tapPointerStartEvent touchstart from touchend event', function() {
    var startEvent = { clientX: 100, clientY: 100 };
    tapTouchStart(startEvent);

    var endEvent = { clientX: 200, clientY: 100, pointerType: 'touch' };
    expect( tapPointerStartEvent(endEvent) ).toBe(startEvent);

    endEvent = { clientX: 200, clientY: 100, type: 'touchend' };
    expect( tapPointerStartEvent(endEvent) ).toBe(startEvent);
  });

  it('Should tapPointerStartEvent mousedown from mouse event', function() {
    var startEvent = { clientX: 100, clientY: 100 };
    tapMouseDown(startEvent);

    var endEvent = { clientX: 102, clientY: 102, type: 'mousedown' };
    expect( tapPointerStartEvent(endEvent) ).toBe(startEvent);

    endEvent = { clientX: 102, clientY: 102 };
    expect( tapPointerStartEvent(endEvent) ).toBe(startEvent);
  });

  it('Should tapClick with touchend and fire immediately', function() {
    var startEvent = {
      target: {
        tagName: 'button',
        dispatchEvent: function(){
          this.dispatchedEvent = true;
        }
      }
    }
    var endEvent = { type: 'touchend', clientX: 100, clientY: 100, target: document.createElement('div') };
    tapClick(startEvent, endEvent);
    expect(startEvent.target.dispatchedEvent).toEqual(true);
  });

  it('Should tapHasPointerMoved false if are null', function() {
    expect( tapHasPointerMoved(null) ).toEqual(false);
  });

  it('Should tapPointerStart false if are null', function() {
    tapPointerStart = null;
    expect( tapHasPointerMoved(null) ).toEqual(false);
  });

  it('Should tapPointerStart false if are null', function() {
    var endEvent = {};
    tapPointerStart = {x:0, y:0};
    expect( tapHasPointerMoved(endEvent) ).toEqual(false);
  });

  it('Should tapHasPointerMoved true if greater than or equal to release tolerance', function() {
    tapPointerStart = { x: 100, y: 100 };

    var s = tapHasPointerMoved({ clientX: 111, clientY: 100 });
    expect(s).toEqual(true);

    s = tapHasPointerMoved({ clientX: 89, clientY: 100 });
    expect(s).toEqual(true);

    s = tapHasPointerMoved({ clientX: 100, clientY: 107 });
    expect(s).toEqual(true);

    s = tapHasPointerMoved({ clientX: 100, clientY: 93 });
    expect(s).toEqual(true);

    s = tapHasPointerMoved({ clientX: 100, clientY: 200 });
    expect(s).toEqual(true);
  });

  it('Should tapHasPointerMoved false if less than release tolerance', function() {
    tapPointerStart = { x: 100, y: 100 };

    var s = tapHasPointerMoved({ clientX: 100, clientY: 100 });
    expect(s).toEqual(false);

    s = tapHasPointerMoved({ clientX: 104, clientY: 100 });
    expect(s).toEqual(false);

    s = tapHasPointerMoved({ clientX: 96, clientY: 100 });
    expect(s).toEqual(false);

    s = tapHasPointerMoved({ clientX: 100, clientY: 102 });
    expect(s).toEqual(false);

    s = tapHasPointerMoved({ clientX: 100, clientY: 98 });
    expect(s).toEqual(false);
  });

  it('Should not be tapHasPointerMoved if 0 coordinates', function() {
    var startEvent = { clientX: 0, clientY: 0 };
    var s = tapHasPointerMoved(startEvent, { clientX: 100, clientY: 100 });
    expect(s).toEqual(false);
  });

  it('Should dispatch a mouse event', function() {
    var startEvent = {
      clientX: 99, clientY: 88,
      target: {
        dispatchEvent: function(clickEvent) {
          this.clickEvent = clickEvent;
        },
        tagName: 'INPUT',
        focus: function() { startEvent.target.focused = true }
      }
    };
    var endEvent = { clientX: 100, clientY: 90, target: document.createElement('div') };
    tapClick(startEvent, endEvent);

    expect(startEvent.target.clickEvent.clientX).toEqual(100);
    expect(startEvent.target.clickEvent.clientY).toEqual(90);
  });

  it('Should get coordinates from page mouse event', function() {
    var e = { pageX: 77, pageY: 77 };
    var c = getPointerCoordinates(e);
    expect(c).toEqual({x:77, y: 77});
  });

  it('Should get coordinates from client mouse event', function() {
    var e = { clientX: 77, clientY: 77 };
    var c = getPointerCoordinates(e);
    expect(c).toEqual({x:77, y: 77});
  });

  it('Should get coordinates from changedTouches touches', function() {
    var e = {
      touches: [{ clientX: 99, clientY: 99 }],
      changedTouches: [{ clientX: 88, clientY: 88 }]
    };
    var c = getPointerCoordinates(e);
    expect(c).toEqual({x:88, y: 88});
  });

  it('Should get coordinates from page touches', function() {
    var e = {
      touches: [{ pageX: 99, pageY: 99 }]
    };
    var c = getPointerCoordinates(e);
    expect(c).toEqual({x:99, y: 99});
  });

  it('Should get coordinates from client touches', function() {
    var e = {
      touches: [{ clientX: 99, clientY: 99 }]
    };
    var c = getPointerCoordinates(e);
    expect(c).toEqual({x:99, y: 99});
  });

  it('Should get 0 coordinates', function() {
    var e = {};
    var c = getPointerCoordinates(e);
    expect(c).toEqual({x:0, y: 0});
  });

  it('Should not tapClick for disabled elements', function() {
    // Disabled elements should not be tapped
    var targetEle = document.createElement('input');
    targetEle.disabled = true;

    var startEvent = {
      target: targetEle
    }

    expect( tapClick(startEvent) ).toEqual(false);
  });

  it('Should not tapClick for input[range] elements', function() {
    // Range and tap do not agree, probably because it doesn't have a delay to begin with
    var targetEle = document.createElement('input');
    targetEle.type = 'range';

    var startEvent = {
      target: targetEle
    }

    expect( tapClick(startEvent) ).toEqual(false);
  });

  it('Should not tapIgnoreElementClick for common inputs', function() {
    var inputTypes = ['text', 'email', 'search', 'tel', 'number', 'date', 'month', 'password', null, undefined, ''];
    for(var x=0; x<inputTypes.length; x++) {
      var targetEle = document.createElement('input');
      targetEle.type = inputTypes[x];
      expect( tapIgnoreElementClick(targetEle) ).toEqual(false);
    }
    expect( tapIgnoreElementClick( document.createElement('img') ) ).toEqual(false);
    expect( tapIgnoreElementClick( document.createElement('div') ) ).toEqual(false);
    expect( tapIgnoreElementClick( document.createElement('textarea') ) ).toEqual(false);
    expect( tapIgnoreElementClick( document.createElement('select') ) ).toEqual(false);
  });

  it('Should tapIgnoreElementClick for an element with data-tap-disabled attribute', function() {
    var div = document.createElement('div');
    expect( tapIgnoreElementClick( div ) ).toEqual(false);

    div.setAttribute('data-tap-disabled', "true")
    expect( tapIgnoreElementClick( div ) ).toEqual(true);
  });

  it('Should tapIgnoreElementClick for an element with one of its parents with data-tap-disabled attribute', function() {
    var div1 = document.createElement('div');
    var div2 = document.createElement('div');
    var div3 = document.createElement('div');
    var div4 = document.createElement('div');
    var div5 = document.createElement('div');

    div1.appendChild(div2);
    div2.appendChild(div3);
    div3.appendChild(div4);
    div4.appendChild(div5);

    div2.setAttribute('data-tap-disabled', "true");

    expect( tapIgnoreElementClick( div1 ) ).toEqual(false);
    expect( tapIgnoreElementClick( div2 ) ).toEqual(true);
    expect( tapIgnoreElementClick( div3 ) ).toEqual(true);
    expect( tapIgnoreElementClick( div4 ) ).toEqual(true);
    expect( tapIgnoreElementClick( div5 ) ).toEqual(true);
  });

  it('Should not allow a click that has an input target but not created by tapClick', function() {
    var e = {
      target: document.createElement('input'),
      stopPropagation: function(){ this.stoppedPropagation = true },
      preventDefault: function(){ this.preventedDefault = true }
    };
    tapClickGateKeeper(e);

    expect( e.stoppedPropagation ).toBeDefined();
    expect( e.preventedDefault ).toBeDefined();
  });

  it('Should allow a click that is a tapClick', function() {
    var e = {
      target: document.createElement('input'),
      isIonicTap: true,
      stopPropagation: function(){ this.stoppedPropagation = true },
      preventDefault: function(){ this.preventedDefault = true }
    };
    tapClickGateKeeper(e);

    expect( e.stoppedPropagation ).toBeUndefined();
    expect( e.preventedDefault ).toBeUndefined();
  });

  it('Should allow a click that is an ignore element', function() {
    var e = {
      target: document.createElement('input'),
      stopPropagation: function(){ this.stoppedPropagation = true },
      preventDefault: function(){ this.preventedDefault = true }
    };
    e.target.type = 'range';
    tapClickGateKeeper(e);

    expect( e.stoppedPropagation ).toBeUndefined();
    expect( e.preventedDefault ).toBeUndefined();
  });

  it('Should focus input', function() {
    var ele = {
      tagName: 'INPUT',
      focus: function(){ this.hasFocus=true; }
    }
    tapHandleFocus(ele);
    expect( ele.hasFocus ).toEqual(true);
  });

  it('Should focus textarea', function() {
    var ele = {
      tagName: 'TEXTAREA',
      focus: function(){ this.hasFocus=true; }
    }
    tapHandleFocus(ele);
    expect( ele.hasFocus ).toEqual(true);
  });

  it('Should focus select', function() {
    var ele = {
      tagName: 'SELECT',
      focus: function(){ this.hasFocus=true; },
      dispatchEvent: function(){}
    }
    tapHandleFocus(ele);
    expect( ele.hasFocus ).toEqual(true);
  });

  it('Should not focus on common elements', function() {
    var tags = ['div', 'span', 'i', 'body', 'section', 'article', 'aside', 'li', 'p', 'header', 'button', 'ion-content'];
    for(var x=0; x<tags.length; x++) {
      var ele = {
        tagName: tags[x],
        focus: function(){ this.hasFocus=true; }
      }
      tapHandleFocus(ele);
      expect( ele.hasFocus ).toBeUndefined();
    }
  });

  it('Should not focus on an input that already has focus', function() {
    var ele = {
      tagName: 'INPUT',
      focus: function(){ this.hasFocus=true; }
    }
    tapHandleFocus(ele);
    expect( ele.hasFocus ).toEqual(true);

    ele.focus = function(){ this.hasSecondFocus=true }
    tapHandleFocus(ele);
    expect( ele.hasSecondFocus ).toBeUndefined();
  });

  it('Should not focus out on common elements', function() {
    var tags = ['div', 'span', 'i', 'body', 'section', 'article', 'aside', 'li', 'p', 'header', 'button', 'ion-content'];
    for(var x=0; x<tags.length; x++) {
      var ele = {
        tagName: tags[x],
        blur: function(){ this.hasBlurred=true; }
      }
      tapActiveElement(ele);
      tapFocusOutActive(ele);
      expect( ele.hasBlurred ).toBeUndefined();
    }
  });

  it('Should focus out on input elements', function() {
    var tags = ['input', 'textarea', 'select'];
    for(var x=0; x<tags.length; x++) {
      var ele = {
        tagName: tags[x],
        blur: function(){ this.hasBlurred=true; }
      }
      tapActiveElement(ele);
      tapFocusOutActive(ele);
      expect( ele.hasBlurred ).toEqual(true);
    }
  });

  it('Should not prevent scrolling', function() {
    var target = document.createElement('div');
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(false);
  });

  it('Should prevent scrolling because the event has defaultedPrevented', function() {
    var target = document.createElement('div');
    var e = {
      target: target,
      defaultPrevented: true
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);
  });

  it('Should not prevent scrolling if the target was an input or textarea', function() {
    var target = document.createElement('input');
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(false);
  });

  it('Should prevent scrolling if the target was an input or textarea, and the target is the same as the active element', function() {
    var target = document.createElement('input');
    tapActiveElement(target);
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);
  });

  it('Should not prevent scrolling if the target isContentEditable', function() {
    var target = document.createElement('div');
    target.isContentEditable = true;
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(false);
  });

  it('Should prevent scrolling if the target has dataset.preventScroll', function() {
    var target = document.createElement('div');
    target.setAttribute('data-prevent-scroll', 'true');
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);

    target = document.createElement('div');
    target.dataset.preventScroll = true;
    e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);

    target = document.createElement('div');
    target.dataset.preventScroll = 'true';
    e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);
  });

  it('Should prevent scrolling if the browser doesnt support dataset but target has data-prevent-default attribute', function() {
    var target = {
      tagName: 'div',
      getAttribute: function(val) {
        if(val === 'data-prevent-default') {
          return 'true';
        }
      }
    }
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);
  });

  it('Should prevent scrolling if the target is an object or embed', function() {
    var target = document.createElement('object');
    var e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);

    target = document.createElement('embed');
    e = {
      target: target
    };
    expect( ionic.tap.ignoreScrollStart(e) ).toEqual(true);
  });

  it('Should get target element from startEvent', function() {
    var startEvent = {
      target: document.createElement('div')
    };
    expect( tapTargetElement(startEvent, null).tagName ).toEqual('DIV');
  });

  it('Should get target element from endEvent', function() {
    var endEvent = {
      target: document.createElement('div')
    };
    expect( tapTargetElement(null, endEvent).tagName ).toEqual('DIV');
  });

  it('Should get labels input control from startEvents target', function() {
    var label = document.createElement('label');
    var input = document.createElement('input');
    label.appendChild(input);

    var startEvent = {
      target: label
    };
    expect( tapTargetElement(startEvent, null).tagName ).toEqual('INPUT');
  });

  it('Should get button target even if it has children from startEvents target', function() {
    var button = document.createElement('button');
    var span = document.createElement('span');
    button.appendChild(span);

    var startEvent = {
      target: button
    };
    expect( tapTargetElement(startEvent, null).tagName ).toEqual('BUTTON');
  });

});
