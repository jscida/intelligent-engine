var auth = require('./auth');
var vrdhooker = require('./vrdhooker');
var log = require('./logger');

module.exports.authenticator = auth.authenticator;
module.exports.vrdhooker = vrdhooker.hooker;
module.exports.logger = log.logger;