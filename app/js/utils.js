window.app = window.app || {};

(function(module){
  'use strict';

  /**
   * Extract fragment from uri. Delimeter is '#'
   * @param  {String} uri Uri
   * @return {Object}     Hash of fragments
   */
  module.parseUriParams = function(uri) {
    var params = {};
    var fragment = uri.split('#')[1];
    if (!fragment) {
      return {};
    }
    _.map(fragment.split('&'), function(pair) {
      var p = pair.split('=');
      params[p[0]] = p[1];
      return params;});
    return params;};

})(window.app);
