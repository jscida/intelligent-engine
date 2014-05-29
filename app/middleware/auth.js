var response = require('../common/response');
var errors = require('../errors');
var util = require('../common/util');
var AUTH_TOKEN_HEADER = 'x-authtoken';
var SIGNATURE_HEADER = 'x-signature';
var REQUEST_TIMESTAMP_HEADER = 'x-request-timestamp';
var excludedPaths = [];

/**
 * Request authenticator(it follows express connect coding standard).
 */
module.exports.authenticator = function(paths) {
  for ( var i = 0; i < paths.length; i++) {
    var path = {
      regExp : new RegExp(paths[i].path),
      method : paths[i].method
    };
    excludedPaths.push(path);
  }

  return function authenticator(req, res, next) {
    createAuthInfo(req, res);

    for ( var i = 0; i < excludedPaths.length; i++) {
      if (excludedPaths[i].regExp.test(req.url) && req.method == excludedPaths[i].method) {
        next();
        return;
      }
    }
    var isAuth = false;
    try {
      isAuth = authenticate(req, res);
    } catch (e) {
      var err = errors.normalizeError('AUTH_MISSING', e);
      response.handleError(err, res);
      return;
    }

    if (!isAuth) {
      var err = errors.normalizeError('AUTH_MISSING');
      response.handleError(err, res);
      return;
    }
    next();
  };
};

function createAuthInfo(req, res) {
  var authToken = req.headers[AUTH_TOKEN_HEADER];
  if (!authToken) {
    return;
  }
  req.authInfo = util.validateAuthToken(authToken);
}

/**
 * Makes the actual authentication process.
 */
function authenticate(req, res) {

  if (!req.authInfo) {
    throw new Error('The auth token header was not found.');
  }

  var requestSignature = req.headers[SIGNATURE_HEADER];
  var requestTimeStampH = req.headers[REQUEST_TIMESTAMP_HEADER];

  if (!requestTimeStampH || !requestSignature) {
    throw new Error('The request timestamp info is missing.');
  }

  var hashedTimeStamp = util.createSignature(requestTimeStampH, req.authInfo.secret);

  if (hashedTimeStamp != requestSignature) {
    throw new Error('Invalid request signature.');
  }

  return true;
}
