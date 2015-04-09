(function(app) {
  'use strict';
  var $ = require('jquery');
  var _ = require('lodash');
  var open = require('open');
  var Tmpl = require('handlebars');

  var $loginButton = $('#js-loginButon');
  var $loginContainer = $('#js-loginContainer');
  var $favesContainer = $('#js-faves-container');
  var $loading = $('#js-loading');
  var audioFavesTmpl = Tmpl.compile($('#audio-faves-template').html());

  var loadFaves = function() {
    $loading.show();
    $('#js-reload-faves').hide();
    app.loadAllFaves();
  };

  var renderFaves = function() {
    var faves = app.getFaves();
    _.forEach(faves, function(v, k) {
      $favesContainer.append('<img class="owner-photo" src="' + v[0].owner.photo + '"/>');
    });
    $loading.hide();
    $('#js-reload-faves').show();
  };

  var renderAudioFaves = function() {
    var faves = app.getAudioFaves();
    $favesContainer.html(audioFavesTmpl(faves));
    $loading.hide();
    $('#js-reload-faves').show();
  };

  var handleLogin = function() {
    if (app.isLoggedIn) {
      $loginContainer.hide();
    } else {
      $loginContainer.show();
    }
  };

  app.emitter.on('favesLoaded', function() {
    $loading.hide();
    renderAudioFaves();
  });

  app.emitter.on('render', function() {
    $loading.hide();
    return renderFaves();
  });

  $loginButton.on('click', function(ev) {
    ev.preventDefault();
    app.tryGetToken(function() {
      handleLogin();
      loadFaves();
    });
  });

  $('#js-reload-faves').on('click', function(ev) {
    ev.preventDefault();
    loadFaves();
  });

  // wait for db connected
  app.emitter.on('dbLoaded', function(){
    renderAudioFaves();
  });

  //wait for application loaded
  app.mainWindow.on('loaded', function() {
    handleLogin();
  });

  app.mainWindow.on('new-win-policy', function(frame, url, policy){
    open(url);
    policy.ignore();
  });
})(global.app);
