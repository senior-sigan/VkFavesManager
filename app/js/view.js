(function(app) {
  'use strict';
  var $loginButton = $('#js-loginButon');
  var $loginContainer = $('#js-loginContainer');
  var $favesContainer = $('#js-faves-container');
  var $loading = $('#js-loading');

  var loadFaves = function() {
    app.loadAllFaves();
  };

  var handleLogin = function() {
    if (app.isLoggedIn) {
      $loginContainer.hide();
    } else {
      $loginContainer.show();
    }
  };

  // app.events.on('favesLoaded', function() {
  //   $loading.hide();
  //   $favesContainer.html('NYA');
  // });

  app.mainWindow.on('loaded', function() {
    handleLogin();
  });

  $loginButton.on('click', function(ev) {
    ev.preventDefault();
    app.tryGetToken(function() {
      handleLogin();
      loadFaves();
    });
  });
})(global.app);
