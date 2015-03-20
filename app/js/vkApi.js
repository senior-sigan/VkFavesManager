window.app = window.app || {};

(function(module) {
  'use strict';

  var asUrlQuery = function(params) {
    var query = [];
    _.forOwn(params, function(value, key) {
      if (!_.isEmpty(value)) {
        query.push(key + '=' + value);}});

    return query.join('&');};

  var VkApi = function(clientId, secret) {
    this.token = null;
    this.clientId = clientId;
    this.secret = secret;};

  VkApi.prototype.authUrl = function(scope) {
    var query = asUrlQuery({
      'client_id': this.clientId,
      'scope': scope.join(','),
      'redirect_uri': 'https://oauth.vk.com/blank.html',
      'display': 'page',
      'response_type': 'token'});

    return 'https://oauth.vk.com/authorize?' + query;};

  VkApi.prototype.faveGetPosts = function(successCallback, errorCallback, options) {
    options = options || {};
    options['access_token'] = this.token;
    var query = asUrlQuery(options);
    var url = 'https://api.vk.com/method/fave.getPosts?' + query;
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      successCallback(JSON.parse(xhr.responseText), xhr);
    };
    xhr.onerror = function() {
      errorCallback(xhr.status, xhr.statusText, JSON.parse(xhr.responseText), xhr);
    };
    xhr.open('GET', url, true);
    xhr.send(null);};

  module.VkApi = VkApi;
})(window.app);
