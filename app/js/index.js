window.app = window.app || {};

(function(module) {
  'use strict';

  var gui = require('nw.gui');
  var db = new PouchDB('faves', {adapter: 'idb'});
  var vk = new module.VkApi('4831539', 'Sw8Zad1RgldsCXwlGK04');
  var scope = ['friends'];
  var url = vk.authUrl(scope);
  var MAX_REQUEST_COUNT = 100;

  var logOut = function() {
    localStorage.clear();
    //TODO: clear all cookies
  };

  var tryGetToken = function(callback) {
    if (localStorage.token) {
      callback(localStorage.token);}
    else {
      startOauth(url, function(token) {
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

  var loadFaves = function(offset) {
    if (_.isUndefined(vk.token)) {
      throw 'No token';}

    vk.faveGetPosts(function(data){
      if (data.error) {
        console.log(data);
        return;
      }
      var faves = data.response.items;
      _.forEach(faves,
        function(fave) {
          fave._id = pouchCollate.toIndexableString([fave.date, fave.id]);
          db.put(fave)
            .then(function(res) {
              if (res.ok) {
              //  console.log('Loaded: ', fave._id);
              }})
            .catch(function(err) {
              console.log(err);});});},

        function(status){
          throw 'Error: ' + status;},

        {count: MAX_REQUEST_COUNT, extended: 0, offset: offset});};

  var loadAllFaves = function() {
    tryGetToken(function(token) {
      vk.token = token;
      // Get count of all faves.
      vk.faveGetPosts(
        function(data) {
          var count = data.response.count;
          console.log('Wkill be loaded: ', count);
          var requestsCount = Math.floor(count / MAX_REQUEST_COUNT);
          _.times(requestsCount, function(i) {
            setTimeout(function() {
              return loadFaves(i * MAX_REQUEST_COUNT);
            }, 300 * i);});},

        function(status) {
          console.log('ERROR: ', status);},

        {count: 1, extended: 0});});};

  module.loadAllFaves = loadAllFaves;
  module.logOut = logOut;

})(window.app);
