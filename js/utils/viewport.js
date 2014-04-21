
var viewportTag;
var viewportProperties = {};


function viewportLoadTag() {
  for(var x=0; x<document.head.children.length; x++) {
    if(document.head.children[x].name == 'viewport') {
      viewportTag = document.head.children[x];
      break;
    }
  }

  if(viewportTag) {
    var props = viewportTag.content.toLowerCase().replace(/\s+/g, '').split(',');
    var x, keyValue;
    for(x=0; x<props.length; x++) {
      keyValue = props[x].split('=');
      if(keyValue.length == 2) viewportProperties[ keyValue[0] ] = keyValue[1];
    }
    viewportInitWebView();
  }
}

function viewportInitWebView() {
  if( ionic.Platform.isWebView() ) {
    viewportProperties.height = 'device-height';
  } else {
    delete viewportProperties.height;
  }
  viewportUpdate();
}

function viewportUpdate(updates) {
  if(!viewportTag) return;

  ionic.Utils.extend(viewportProperties, updates);

  var key, props = [];
  for(key in viewportProperties) {
    if(viewportProperties[key]) props.push(key + '=' + viewportProperties[key]);
  }

  viewportTag.content = props.join(',');
}

ionic.Platform.ready(function() {
  viewportLoadTag();
});
