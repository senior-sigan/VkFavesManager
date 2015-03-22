global.app = global.app || {};

(function(module) {
  'use strict';
  var _ = require('lodash');

  var API_VERSION = '5.29';

  var asUrlQuery = function(params) {
    var query = [];
    _.forOwn(params, function(value, key) {
      if (!_.isNull(value) && !_.isUndefined(value) && !_.isEmpty(value.toString())) {
        query.push(key + '=' + value);
      }
    });
    return query.join('&');
  };

  var VkApi = function(clientId, secret) {
    this.token = null;
    this.clientId = clientId;
    this.secret = secret;
  };

  /**
   * Get vk client side oauth url
   * @see  {@link http://vk.com/dev/auth_mobile} About client-side vk oauth
   * @see  {@link http://vk.com/dev/permissions} About permissions
   * @param  {Array[String]} scope Colection of permissions.
   * @return {[type]}       [description]
   */
  VkApi.prototype.authUrl = function(scope) {
    var query = asUrlQuery({
      'client_id': this.clientId,
      'scope': scope.join(','),
      'redirect_uri': 'https://oauth.vk.com/blank.html',
      'display': 'page',
      'response_type': 'token'
    });

    return 'https://oauth.vk.com/authorize?' + query;
  };

  /**
   * Get list of faves
   * @see  {@link http://vk.com/dev/fave.getPosts} fave.getPosts documentation
   * @param  {function} successCallback Called on success. Return vk response
   * @param  {function} errorCallback   Called on errors
   * @param  {Object} options         Hash of api params
   */
  VkApi.prototype.faveGetPosts = function(successCallback, errorCallback, options) {
    options = options || {};
    options['access_token'] = this.token;
    options['v'] = API_VERSION;
    var query = asUrlQuery(options);
    var url = 'https://api.vk.com/method/fave.getPosts?' + query;
    var xhr = new global.window.XMLHttpRequest();
    xhr.onload = function() {
      successCallback(JSON.parse(xhr.responseText), xhr);
    };
    xhr.onerror = function() {
      errorCallback(xhr.status, xhr.statusText, JSON.parse(xhr.responseText), xhr);
    };
    console.log('VkApi: SendRequest: ', url);
    xhr.open('GET', url, true);
    xhr.send(null);
  };

  module.VkApi = VkApi;
})(global.app);
