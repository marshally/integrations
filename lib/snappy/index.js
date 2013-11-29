
var debug       = require('debug')('segmentio:integrations:snappy')
  , Integration = require('segmentio-integration')
  , request     = require('request-retry')({ retries : 2 })
  , unixTime    = require('unix-time')
  , util        = require('util');


module.exports = Snappy;


function Snappy () {
  this.name = 'Snappy';
  this.baseUrl = 'http://localhost:3000/v1';
}


util.inherits(Snappy, Integration);


/**
 * Check whether the integration is enabled
 */

Snappy.prototype.enabled = function (message, settings) {
  return Integration.enabled.apply(this, arguments) &&
         message.channel() === 'server';
};


/**
 * Validate the settings for the project
 */

Snappy.prototype.validate = function (message, settings) {
  return this._missingSetting(settings, 'appToken');
};


/**
 * Create or Update a Snappy user
 */
Snappy.prototype.identify = function (identify, settings, callback) {

  var userid = identify.userId() || identify.sessionId();

  var request_body = {
    email: identify.email(),
    token: settings.appToken
  }

  if (identify.created()) {
    request_body['observed_at'] = unixTime(identify.created());
  }
  request['traits'] = identify.traits();

  var req = {
    url  : this.baseUrl + "/users/" + userid,
    json : request_body
  };

  debug('making create user request');
  request.post(req, this._handleResponse(callback));
};


/**
 * Track a Snappy event
 */
Snappy.prototype.track = function (track, settings, callback) {

  var userid     = track.userId() || track.sessionId()
    , properties = track.properties();

  var request_body = {
    userid: userid,
    token: settings.appToken,
    name: track.event(),
    properties: properties,
    obaserved_at: unixTime(track.timestamp())
  };

  var req = {
    url: this.baseUrl + '/events',
    json: request_body
  };

  debug('making track request');
  request.post(req, this._handleResponse(callback));
};
