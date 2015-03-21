window.app = window.app || {};

(function(module) {
  'use strict';

  var gui = require('nw.gui');
  var vk = new module.VkApi('4831539', 'Sw8Zad1RgldsCXwlGK04');
  var scope = ['friends'];
  var url = vk.authUrl(scope);

  var logOut = function() {
    localStorage.clear();
    //TODO: clear all cookies
  };

  var tryGetToken = function(authUrl, callback) {
    if (localStorage.token) {
      callback(localStorage.token);}
    else {
      startOauth(authUrl, function(token) {
        localStorage.token = token;
        callback(token);});}};

  var startOauth = function(authUrl, callback) {
    var popup = gui.Window.open(authUrl, {focuse: true});
    popup.on('loaded', function() {
      var url = popup.window.location.href;
      var query = module.parseUriParams(url);
      if (query) {
        var token = query['access_token'];
        if (token) {
          popup.close();
          callback(token);}}});};

  tryGetToken(url, function(t){console.log(t);});

})(window.app);
