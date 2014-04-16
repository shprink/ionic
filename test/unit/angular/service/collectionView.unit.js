describe('$collectionViewDataSource service', function() {
  beforeEach(module('ionic'));

  function setup(options) {
    var dataSource;
    inject(function($collectionViewDataSource, $rootScope) {
      dataSource = new $collectionViewDataSource(angular.extend({
        scope: $rootScope.$new(),
        listExpr: 'items',
        keyExpr: 'item'
      }, options || {}));
    });
    return dataSource;
  }

  it('should use hashKey for trackByExpr by default', function() {
    spyOn(window, 'hashKey').andReturn('hashy');
    var source = setup();
    expect(source.trackByIdGetter(1, 2)).toBe('hashy');
  });

  it('should use provided trackByExpr for hashing', function() {
    var source = setup({
      trackByExpr: 'track($index, item)'
    });
    source.scope.track = jasmine.createSpy('track').andReturn('monkey');
    expect(source.trackByIdGetter(1, 2)).toBe('monkey');
    expect(source.scope.track).toHaveBeenCalledWith(1, 2);
  });

  it('itemCache should use trackByIdGetter for the key', function() {
    var source = setup();
    var item = {};
    spyOn(source, 'trackByIdGetter').andReturn('elephant');
    source.itemCache.put(1, 2, item);
    expect(source.$cache.get('elephant')).toBe(item);
    expect(source.itemCache.get(1, 2)).toBe(item);
  });

  describe('.compileItem()', function() {
    it('should return cached item', function() {
      var source = setup();
      var item = {};
      spyOn(source.itemCache, 'get').andReturn(item);
      expect(source.compileItem(1, 2)).toBe(item);
    });

    it('should compile a new item', function() {
      var el = angular.element('<div>');
      var source = setup({
        transcludeFn: function(scope, cb) { cb(el); }
      });
      spyOn(source.itemCache, 'put').andCallThrough();
      var item = source.compileItem(1,2);
      expect(source.itemCache.put).toHaveBeenCalledWith(1, 2, item);
      expect(item.scope.$parent).toBe(source.scope);
      expect(item.scope.item).toBe(2);
      expect(item.element).toBe(el);
    });
  });
  describe('.getItemAt()', function() {
    it('should return item only if given index < length', function() {
      var source = setup();
      var item = { scope: {}, value: 'foo' };
      source.data = ['val'];
      spyOn(source, 'compileItem').andReturn(item);
      expect(source.getItemAt(0)).toBe(item);
      expect(source.getItemAt(1)).toBeFalsy();
      expect(source.getItemAt(2)).toBeFalsy();
    });
    it('should set properties on given item scope', function() {
      var source = setup();
      var item = { scope: {}, value: 'foo' };
      source.data = [0, 1, 2];
      spyOn(source, 'compileItem').andReturn(item);

      item = source.getItemAt(0);
      expect(item.scope.$index).toBe(0);
      expect(item.scope.$first).toBe(true);
      expect(item.scope.$last).toBe(false);
      expect(item.scope.$middle).toBe(false);
      expect(item.scope.$odd).toBe(false);
      item = source.getItemAt(1);
      expect(item.scope.$index).toBe(1);
      expect(item.scope.$first).toBe(false);
      expect(item.scope.$last).toBe(false);
      expect(item.scope.$middle).toBe(true);
      expect(item.scope.$odd).toBe(true);
      item = source.getItemAt(2);
      expect(item.scope.$index).toBe(2);
      expect(item.scope.$first).toBe(false);
      expect(item.scope.$last).toBe(true);
      expect(item.scope.$middle).toBe(false);
      expect(item.scope.$odd).toBe(false);
    });
  });
  it('.detachItem() should removeChild & disconnect', function() {
    var parent = { removeChild: jasmine.createSpy('removeChild') };
    var element = [{ parentNode: parent }];
    var source = setup();
    var item = {
      element: element,
      scope: {}
    };
    spyOn(window, 'disconnectScope');
    source.detachItem(item);
    expect(parent.removeChild).toHaveBeenCalledWith(item.element[0]);
    expect(disconnectScope).toHaveBeenCalledWith(item.scope);
  });
  it('.attachItem()', function() {
    var parent = angular.element('<div>');
    var element = angular.element('<div>');
    var source = setup({
      transcludeParent: parent
    });
    var item = {
      element: element,
      scope: {}
    };
    spyOn(parent[0], 'appendChild');
    spyOn(window, 'reconnectScope');
    source.attachItem(item);
    expect(parent[0].appendChild).toHaveBeenCalledWith(item.element[0]);
    expect(reconnectScope).toHaveBeenCalledWith(item.scope);
  });

  it('.setData', function() {
    var source = setup();
    expect(source.data).toBeUndefined();
    var data = [];
    source.setData(data);
    expect(source.data).toBe(data);
    expect(function() {
      source.setData({});
    }).toThrow();
    source.setData(null);
    expect(source.data).toBe(null);
  });

  it('.getLength', function() {
    var source = setup();
    expect(source.getLength()).toBe(0);
    source.data = [1,2,3];
    expect(source.getLength()).toBe(3);
  });
});
