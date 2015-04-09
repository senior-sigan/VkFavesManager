'use strict';

var security = require('../scripts/security');
var data = require('../scripts/repository');
var $ = global.jQuery;
var _ = require('lodash');
var open = require('open');
var Tmpl = require('handlebars');
var players = [];

var $loginButton = $('#js-loginButon');
var $loginContainer = $('#js-loginContainer');
var $favesContainer = $('#js-faves-container');
var $loading = $('#js-loading');
var audioFavesTmpl = Tmpl.compile($('#audio-faves-template').html());

var loadFaves = function() {
  $loading.show();
  $('#js-reload-faves').hide();
  data.loadAllFaves();
};

var renderAudioFaves = function() {
  var faves = data.getAudioFaves();
  $favesContainer.html(audioFavesTmpl(faves));
  $loading.hide();
  $('#js-reload-faves').show();
};

var handleLogin = function() {
  if (security.isLoggedIn) {
    $loginContainer.hide();
  } else {
    $loginContainer.show();
  }
};

data.emitter.on('favesLoaded', function() {
  $loading.hide();
  renderAudioFaves();
});

$loginButton.on('click', function(ev) {
  ev.preventDefault();
  security.tryGetToken(function() {
    handleLogin();
    loadFaves();
  });
});

$('#js-reload-faves').on('click', function(ev) {
  ev.preventDefault();
  loadFaves();
});

var stopPlaying = function() {
  _.forEach(players, function(player) {
    player.pause(function() {});
  });
  players = [];
};

$(window.document).on('click', '.js-audio', function(ev) {
  ev.preventDefault();
  stopPlaying();
  var url = this.dataset.audio;
  console.log(url);
  var audio = new global.Audio(url);
  audio.play();
  players.push(audio);
});

// wait for db connected
data.emitter.on('dbLoaded', function(){
  renderAudioFaves();
});

//wait for application loaded
global.mainWindow.on('loaded', function() {
  handleLogin();
});

global.mainWindow.on('new-win-policy', function(frame, url, policy){
  open(url);
  policy.ignore();
});
