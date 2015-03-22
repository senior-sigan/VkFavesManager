window.app = window.app || {};

(function(module) {
  'use strict';

  var gui = require('nw.gui');
  var path = require('path');
  var NeDB = require('nedb');
  var db = new NeDB({filename: path.join(gui.App.dataPath, 'faves.db'), autoload: true});
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

    vk.faveGetPosts(
      function(data){
        if (data.error) {
          console.log(data);
          return;
        }
        var faves = data.response.items;
        _.forEach(faves,
          function(fave) {
            fave._id = [fave.id, fave.date].join('.');
            db.insert(fave, function(err) {
              if (err) {
                console.log(err);}});});},

      function(status){
        throw 'Error: ' + status;},

      {count: MAX_REQUEST_COUNT, extended: 0, offset: offset});};

  var loadAllFaves = function() {
    tryGetToken(function(token) {
      vk.token = token;
      // Get count of all faves.
      vk.faveGetPosts(
        function(data) {
          if (data.error) {
            if (data.error['error_code'] === 5) {
              console.log(data);
              return;
            }
            console.log(data.error);
          }
          var count = data.response.count;
          console.log('Will be loaded: ', count);
          var requestsCount = Math.floor(count / MAX_REQUEST_COUNT);
          _.times(requestsCount, function(i) {
            setTimeout(function() {
              return loadFaves(i * MAX_REQUEST_COUNT);
            }, 400 * i);});},

        function(status) {
          console.log('ERROR: ', status);},

        {count: 1, extended: 0});});};


  var getGroups = function() {
    return _.groupBy(
      _.filter(db.getAllData(), function(doc) {
        return _.pick(doc, ['id', 'owner_id', 'from_id', 'text', 'attachments', 'likes']);
      }), function(doc) {
        return doc['owner_id'];
      });
  };

  module.loadAllFaves = loadAllFaves;
  module.logOut = logOut;
  module.getGroups = getGroups;
  module.db = db;

})(window.app);
