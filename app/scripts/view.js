'use strict';

var security = require('../scripts/security');
var data = require('../scripts/repository');
var AudioPlayer = require('../scripts/audioPlayer');
var $ = global.jQuery;
var _ = require('lodash');
var open = require('open');
var Handlebars = require('handlebars');

var $loginButton = $('#js-loginButon');
var $loginContainer = $('#js-loginContainer');
var $favesContainer = $('#js-faves-container');
var $loading = $('#js-loading');
var audioFavesTmpl = Handlebars.compile($('#audio-faves-template').html());
var audioPlayer;
var currentPlaying = -1;

var loadFaves = function() {
  $loading.show();
  $('#js-reload-faves').hide();
  data.loadAllFaves();
};

var renderAudioFaves = function() {
  var faves = data.getAudioFaves();
  var i = 0;
  _.forEach(faves, function(faves) {
    _.forEach(faves, function(fave) {
      _.forEach(fave.attachments, function(attachment) {
        attachment.number = i++;
      });
    });
  });
  audioPlayer = new AudioPlayer();
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

$(window.document).on('click', '.js-audio', function(ev) {
  ev.preventDefault();
  var url = this.dataset.audio;
  $('.js-audio[data-number=' + currentPlaying + ']').removeClass('stop-btn').addClass('play-btn');
  if (currentPlaying === this.dataset.number) {
    audioPlayer.stop();
    return;
  }
  currentPlaying = this.dataset.number;
  $('.js-audio[data-number=' + currentPlaying + ']').addClass('stop-btn').removeClass('play-btn');
  audioPlayer.play(url, function() {
    //number++;
    //return $('.js-audio[data-number=' + number + ']').dataset.audio;
  });
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
