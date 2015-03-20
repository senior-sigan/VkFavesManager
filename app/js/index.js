window.app = window.app || {};

(function(module) {
  'use strict';

  var gui = require('nw.gui');
  var vk = new module.VkApi('4831539', 'Sw8Zad1RgldsCXwlGK04');
  var scope = ['friends'];
  var url = vk.authUrl(scope);

  var startOauth = function(authUrl, callback) {
    var popup = gui.Window.open(authUrl, {focuse: true});
    popup.on('loaded', function() {
      var url = popup.window.location.href;
      console.log(url);
      var query = module.parseUriParams(url);
      console.log(query);
      if (query) {
        var token = query['access_token'];
        if (token) {
          console.log(token);
          popup.close();
          callback(token);}}});};

  startOauth(url, function(token) {console.log(token);});

})(window.app);
