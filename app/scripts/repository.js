'use strict';

var path = require('path');
var NeDB = require('nedb');
var _ = require('lodash');
var events = require('events');
var security = require('../scripts/security');
var vk = security.vk;

var emitter = new events.EventEmitter();

var db = new NeDB({
  filename: path.join(gui.App.dataPath, 'faves.db'),
  autoload: true,
  onload: function(err) {
    if (err) {
      console.log(err);
    } else {
      emitter.emit('dbLoaded');
    }
  }
});

var MAX_REQUEST_COUNT = 100;
var loaded = 0;
var toLoad = 0;

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
    // don't check db errors. Calculate only success loadings
    loaded++;
    if (loaded === toLoad) {
      emitter.emit('favesLoaded');
      console.log('favesLoaded');
    }
  });
};

var requestsError = function(status) {
  throw 'Error: ' + status;
};

var loadFaves = function(offset) {
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
      security.logOut();
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
  security.tryGetToken(function(token) {
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

var filterAudio = function(doc) {
  doc.attachments = _.filter(doc.attachments || [], function(attachment) {
    return attachment.type === 'audio';
  });
  if (doc.copy_history) {
    var repostDoc = filterAudio(doc.copy_history[0]) || {};
    doc.attachments = _.union(doc.attachments, repostDoc.attachments);
  }
  if (doc.attachments.length > 1) {
    return doc;
  }
};


var getAudioFaves = function() {
  var docs = db.getAllData();

  return groupByOwner(_.compact(_.map(docs, filterAudio)));
};

module.exports.loadAllFaves = loadAllFaves;
module.exports.getFaves = getFaves;
module.exports.getAudioFaves = getAudioFaves;
module.exports.emitter = emitter;

