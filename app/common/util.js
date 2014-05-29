var crypto = require('crypto');

var POSITIVE_INT_REGEX = /^\d+$/;
var SALT_LEN = 32;
var ITERATIONS = 25000;
var KEY_LEN = 512;

var validateKeys = function(obj, keysArray) {
  var errors = require('../errors');

  for ( var i = 0; i < keysArray.length; i++) {
    var key = keysArray[i];
    var splitted = key.split('.');

    if (splitted.length == 1) {
      if (obj[splitted[0]]) {
        throw errors.normalizeError('PROPERTY_READONLY', null, key);
      }
    }
    if (splitted.length == 2) {
      if (obj[splitted[0]] && obj[splitted[0]][splitted[1]]) {
        throw errors.normalizeError('PROPERTY_READONLY', null, key);
      }
    }
    if (splitted.length == 3) {
      if (obj[splitted[0]] && obj[splitted[0]][splitted[1]] && obj[splitted[0]][splitted[1]][splitted[2]]) {
        throw errors.normalizeError('PROPERTY_READONLY', null, key);
      }
    }
  }
};

var sanitizeKeys = function(obj, keysArray) {
  for ( var i = 0; i < keysArray.length; i++) {
    var key = keysArray[i];
    var splitted = key.split('.');

    if (splitted.length == 1) {
      if (obj[splitted[0]]) {
        delete obj[splitted[0]];
      }
    }
    if (splitted.length == 2) {
      if (obj[splitted[0]] && obj[splitted[0]][splitted[1]]) {
        delete obj[splitted[0]][splitted[1]];
      }
    }
    if (splitted.length == 3) {
      if (obj[splitted[0]] && obj[splitted[0]][splitted[1]] && obj[splitted[0]][splitted[1]][splitted[2]]) {
        delete obj[splitted[0]][splitted[1]][splitted[2]];
      }
    }
  }
  return obj;
};

var createAuthInfo = function(authData) {
  var util = require('util');
  var timestamp = new Date().toISOString();
  var text = authData.email + timestamp;
  var key = authData.salt;
  var cipherType = 'aes-128-ecb';
  var cipherKey = '!dEgnaRtsE77++*$';
  var secret;
  var authToken;

  secret = crypto.createHmac('sha1', key).update(text).digest('hex');
  authToken = util.format('%s,%s,%s,%s,%s', authData._id, authData.email, authData.role, timestamp, secret);
  var ecb = new Buffer(authToken);
  var cipher = crypto.createCipher(cipherType, cipherKey);
  var t = [];
  cipher.setAutoPadding(true);
  t.push(cipher.update(ecb, "ascii", "hex"));
  t.push(cipher.final("hex"));
  var encodedToken = t.join('');

  return {
    authtoken : encodedToken,
    secret : secret
  };
};

/**
 * Creates an HMAC SHA1 hash based on the request timestamp and the user's
 * secret.
 */
var createSignature = function(timeStamp, secret) {
  var signature = crypto.createHmac('sha1', secret).update(timeStamp).digest('hex');
  return signature;
};

/**
 * Validates and parses the authentication token.
 */
var validateAuthToken = function(authToken) {
  var cipherType = 'aes-128-ecb';
  var cipherKey = '!dEgnaRtsE77++*$';
  var decipher = crypto.createDecipher(cipherType, cipherKey);
  var t = [];
  t.push(decipher.update(authToken, "hex", "ascii"));
  t.push(decipher.final("ascii"));
  var decodedToken = t.join('').toString();
  var decodedArray = decodedToken.split(',');
  var retObj = {
    userId : decodedArray[0],
    email : decodedArray[1],
    role : decodedArray[2],
    timestamp : new Date(decodedArray[3]),
    secret : decodedArray[4],
  };

  return retObj;
};

var createHashedPassword = function(password, salt) {
  var hashRaw = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN);
  var hash = new Buffer(hashRaw, 'binary').toString('hex');
  return hash;
};

var createSalt = function() {
  var buf = crypto.randomBytes(SALT_LEN);
  return buf.toString('hex');
};

var encodeVerificationLink = function(actorId) {
  var timestamp = new Date().toISOString();
  var cipherType = 'aes-128-ecb';
  var cipherKey = '!dEgnaRtsE77++*$';
  var authToken;

  authToken = actorId + ',' + timestamp;
  var ecb = new Buffer(authToken);
  var cipher = crypto.createCipher(cipherType, cipherKey);
  var t = [];
  cipher.setAutoPadding(true);
  t.push(cipher.update(ecb, "ascii", "hex"));
  t.push(cipher.final("hex"));
  var encodedToken = t.join('');
  return encodedToken;
};

var decodeVerificationLink = function(encoded) {
  var cipherType = 'aes-128-ecb';
  var cipherKey = '!dEgnaRtsE77++*$';
  var decipher = crypto.createDecipher(cipherType, cipherKey);
  var t = [];
  t.push(decipher.update(encoded, "hex", "ascii"));
  t.push(decipher.final("ascii"));
  var decodedToken = t.join('').toString();
  return decodedToken;
};

module.exports.sanitizeKeys = sanitizeKeys;
module.exports.createAuthInfo = createAuthInfo;
module.exports.createSignature = createSignature;
module.exports.validateAuthToken = validateAuthToken;
module.exports.POSITIVE_INT_REGEX = POSITIVE_INT_REGEX;
module.exports.createHashedPassword = createHashedPassword;
module.exports.createSalt = createSalt;
module.exports.validateKeys = validateKeys;
module.exports.encodeVerificationLink = encodeVerificationLink;
module.exports.decodeVerificationLink = decodeVerificationLink;
