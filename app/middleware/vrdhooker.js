var uuid = require('uuid').v4;
var Buffer = require('buffer').Buffer;
var logging = require('../logging');
var buffer = new Buffer(16);

function generateId() {
  uuid({ }, buffer);
  return buffer.toString('hex');
}

function hookReqId(req, res) {
  var id;
  try {
    id = generateId();
  }
  catch (e) {
    next(e);
    return;
  }
  req.id = id;
  res.id = id;
}

function hookCustomLogger(req, res) {
  req.logger = logging.createLogger(req.id);
  res.logger = logging.createLogger(req.id);
}

module.exports.hooker = function() {
  return function hooker(req, res, next) {
    hookReqId(req, res);
    hookCustomLogger(req, res);
    next();
  };
};