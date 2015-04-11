'use strict';

var _ = require('lodash');
var utils = require('../scripts/utils');
var gui = global.gui;
var VkApi = require('../scripts/vkApi');

var vk = new VkApi('4831539', 'Sw8Zad1RgldsCXwlGK04');
var scope = ['friends', 'offline '];

var logOut = function() {
  localStorage.clear();
  //TODO: clear all cookies
};

var isLoggedIn = function() {
  return !_.isUndefined(localStorage.token);
};

var tryGetToken = function(callback) {
  if (global.localStorage.token) {
    callback(global.localStorage.token);
  } else {
    startOauth(vk.authUrl(scope), function(token) {
      global.localStorage.token = token;
      callback(token);
    });
  }
};

var startOauth = function(authUrl, callback) {
  var popup = gui.Window.open(authUrl, {
    focuse: true
  });
  popup.on('loaded', function() {
    var url = popup.window.location.href;
    var query = utils.parseUriParams(url);
    if (query) {
      var token = query['access_token'];
      if (token) {
        popup.close();
        callback(token);
      }
    }
  });
};

module.exports.logOut = logOut;
module.exports.isLoggedIn = isLoggedIn;
module.exports.tryGetToken = tryGetToken;
module.exports.vk = vk;


