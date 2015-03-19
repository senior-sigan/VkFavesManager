(function(module){
    'use strict';

    module.parseUriParams = function(uri) {
      _.map(uri.split('?')[1].split('&'), function(pair) {
        var args = pair.split('=');
        var param = {};
        param[args[0]] = args[1];
        return param;
      });
    };
})(window.app);
