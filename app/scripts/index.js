'use strict';
(function(app) {
  var clientId = '4831539';
  var secret = 'Sw8Zad1RgldsCXwlGK04';
  var scope = ['friends'];
  var vkApi = new app.VkApi(clientId, secret);

  document.addEventListener('DOMContentLoaded', function() {
    var h1 = document.getElementsByTagName('h1');
    if (h1.length > 0) {
      h1[0].innerText = h1[0].innerText + ' \'Allo';
    }
  }, false);
  app.signIn = function() {
    var oauthUrl = vkApi.authUrl(scope);
    chrome.identity.launchWebAuthFlow({url: oauthUrl, interactive: true}, function(responseUri) {
      if (chrome.runtime.lastError) {
        // errorCallback(chrome.runtime.lastError.message);
      }
      //TODO: extract access token
      app.parseUriParams(responseUri);
    });
  };
})(window.app);
