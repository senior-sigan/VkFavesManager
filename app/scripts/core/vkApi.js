(function(window) {
  'use strict';
  window.app = window.app || {};

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

  VkApi.prototype.faveGetPosts = function(options) {
    options['access_token'] = this.token;
    var query = asUrlQuery(options);
    var url = 'https://api.vk.com/method/fave.getPosts?' + query;

    return url;};

  window.app.VkApi = VkApi;
})(window);
