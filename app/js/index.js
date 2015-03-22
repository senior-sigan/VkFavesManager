global.app = global.app || {};

(function(module) {
  'use strict';

  global.$ = jQuery;

  require('../js/utils');
  require('../js/VkApi');

  //module.events = new require('events').EventEmitter();
  var loaded = 0;
  var toLoad = 0;
  var _ = require('lodash');
  var gui = require('nw.gui');
  var path = require('path');
  var NeDB = require('nedb');
  var db = new NeDB({
    filename: path.join(gui.App.dataPath, 'faves.db'),
    autoload: true
  });
  var vk = new module.VkApi('4831539', 'Sw8Zad1RgldsCXwlGK04');
  var scope = ['friends'];
  var url = vk.authUrl(scope);
  var MAX_REQUEST_COUNT = 100;

  var logOut = function() {
    localStorage.clear();
    //TODO: clear all cookies
  };

  var isLoggedIn = function() {
    return !_.isUndefined(localStorage.token);
  };

  var tryGetToken = function(callback) {
    if (localStorage.token) {
      callback(localStorage.token);
    } else {
      startOauth(url, function(token) {
        localStorage.token = token;
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
      var query = module.parseUriParams(url);
      if (query) {
        var token = query['access_token'];
        if (token) {
          popup.close();
          callback(token);
        }
      }
    });
  };

  var saveFave = function(data) {
    if (data.error) {
      console.log(data);
      return;
    }
    var faves = data.response.items;
    var favesWithId = _.map(faves, function(fave) {
      fave._id = [fave.id, fave.date].join('.');
      return fave;
    });
    db.insert(favesWithId, function(err) {
      if (err) {
        console.log(err);
      }
      // don't check db erros. Calculate only success loadings
      loaded++;
      if (loaded === toLoad) {
        //module.events.emit('favesLoaded');
        console.log('favesLoaded');
      }
    });
  };

  var requestsError = function(status) {
    throw 'Error: ' + status;
  };

  var loadFaves = function(offset) {
    if (_.isUndefined(vk.token)) {
      throw 'No token';
    }
    vk.faveGetPosts(saveFave, requestsError, {
      count: MAX_REQUEST_COUNT,
      extended: 0,
      offset: offset
    });
  };

  var initLoading = function(data) {
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
    loaded = 0;
    toLoad = requestsCount;
    _.times(requestsCount, function(i) {
      setTimeout(function() {
        return loadFaves(i * MAX_REQUEST_COUNT);
      }, 400 * i);
    });
  };

  var loadAllFaves = function() {
    tryGetToken(function(token) {
      vk.token = token;
      // Get count of all faves.
      vk.faveGetPosts(initLoading, requestsError, {
        count: 1,
        extended: 0
      });
    });
  };


  var getGroups = function() {
    var docs = db.getAllData();
    var filtered = _.filter(docs, function(doc) {
      return _.pick(doc, ['id', 'owner_id', 'from_id', 'text', 'attachments', 'likes']);
    });
    return _.groupBy(filtered, function(doc) {
      return doc['owner_id'];
    });
  };

  module.loadAllFaves = loadAllFaves;
  module.logOut = logOut;
  module.isLoggedIn = isLoggedIn;
  module.getGroups = getGroups;
  module.db = db;
  module.mainWindow = gui.Window.get();

  require('../js/view.js');

})(global.app);
