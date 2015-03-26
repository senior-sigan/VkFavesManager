global.app = global.app || {};

(function(module) {
  'use strict';

  global.$ = jQuery;
  global.Tmpl = Handlebars;

  require('../js/utils');
  require('../js/VkApi');
  var events = require('events');
  module.emitter = new events.EventEmitter();
  var loaded = 0;
  var toLoad = 0;
  var _ = require('lodash');
  var gui = require('nw.gui');
  var path = require('path');
  var NeDB = require('nedb');
  var db = new NeDB({
    filename: path.join(gui.App.dataPath, 'faves.db'),
    autoload: true,
    onload: function(err) {
      if (err) {
        console.log(err);
      } else {
        module.emitter.emit('dbLoaded');
      }
    }
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
    var profiles = {};
    var groups = {};
    _.forEach(data.response.profiles, function(profile) {
      profiles[profile.id] = {
        id: profile.id,
        name: [profile.first_name, profile.last_name].join(' '),
        url: ['https://vk.com/', profile.screen_name].join(''),
        photo: profile.photo_100 || profile.photo_50,
        type: 'profile'
      };
    });
    _.forEach(data.response.groups, function(group) {
      groups[group.id] = {
        id: group.id,
        name: group.name,
        url: ['https://vk.com/', group.screen_name].join(''),
        photo: group.photo_200 || group.photo_100 || group.photo_50,
        type: group.type
      };
    });

    var favesWithId = _.map(faves, function(fave) {
      fave._id = [fave.id, fave.date].join('.');
      fave.owner = fave.owner_id > 0 ? profiles[fave.owner_id] : groups[Math.abs(fave.owner_id)];
      return fave;
    });
    db.insert(favesWithId, function(err) {
      if (err) {
        console.log(err);
      }
      // don't check db erros. Calculate only success loadings
      loaded++;
      if (loaded === toLoad) {
        module.emitter.emit('favesLoaded');
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
      extended: 1,
      offset: offset
    });
  };

  var initLoading = function(data) {
    if (data.error) {
      if (data.error['error_code'] === 5) {
        console.log(data);
        logOut();
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

  var getFaves = function() {
    var docs = db.getAllData();
    return groupByOwner(docs);
  };

  var groupByOwner = function(docs) {
    var filtered = _.filter(docs, function(doc) {
      return _.pick(doc, ['id', 'owner_id', 'from_id', 'text', 'attachments', 'likes']);
    });
    var grouped = _.groupBy(filtered, function(doc) {
      return doc['owner_id'];
    });
    return _.sortBy(_.map(grouped), function(e){return e.length;}).reverse();
  };

  var getAudioFaves = function() {
    var docs = db.getAllData();
    return groupByOwner(_.compact(_.map(docs, function(doc) {
      doc.attachments = _.filter(doc.attachments || [], function(attachment) {
        return attachment.type === 'audio';
      });
      if (doc.attachments.length > 0) {
        return doc;
      }
    })));
  };

  module.loadAllFaves = loadAllFaves;
  module.getFaves = getFaves;
  module.getAudioFaves = getAudioFaves;
  module.logOut = logOut;
  module.isLoggedIn = isLoggedIn;
  module.db = db;
  module.mainWindow = gui.Window.get();

  require('../js/view.js');

})(global.app);
