window.app = window.app || {};

(function(module){
  'use strict';

  module.parseUriParams = function(uri) {
    var params = {};
    _.map(uri.split('#')[1].split('&'), function(pair) {
      var p = pair.split('=');
      params[p[0]] = p[1];
      return params;});
    return params;};

})(window.app);
