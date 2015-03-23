(function(app) {
  'use strict';
  var _ = require('lodash');

  var $loginButton = $('#js-loginButon');
  var $loginContainer = $('#js-loginContainer');
  var $favesContainer = $('#js-faves-container');
  var $loading = $('#js-loading');

  var loadFaves = function() {
    app.loadAllFaves();
  };

  var renderFaves = function() {
    var groups = app.getGroups();
    _.forEach(groups, function(v, k) {
      $favesContainer.append('<p>' + k + '</p>');
    });
    $loading.hide();
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
    $favesContainer.html('NYA');
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

  // wait for db connected
  app.emitter.on('dbLoaded', function(){
    renderFaves();
  });

  //wait for application loaded
  app.mainWindow.on('loaded', function() {
    handleLogin();
  });
})(global.app);
