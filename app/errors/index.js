var util = require('util');

var errHelper = null;

Error.prototype.formatError = function() {
  var msg = '';
  if (this.meta) {
    msg = this.meta.message + ' - ';
    msg = msg + this.meta.code + ' - ';
  }
  msg = msg + this.stack;
  return msg;
};

var ErrorHelper = function() {
  this.codes = {};
  this.fillErrCodes('common');

};

ErrorHelper.prototype.normalizeError = function(errorCodeName, err, args) {
  var errCode = this.codes[errorCodeName];
  if (!err) {
    err = new Error(errCode.message);
  }
  if (!util.isError(err)) {
    err = new Error(err.message ? err.message : err);
  }
  if (err.meta) {
    return err;
  }
  if (err.name && err.name == 'ValidationError') {
    errCode.errors = err.errors;
    err = new Error(err.message);
  }
  err.meta = {};
  err.meta.code = errCode.code;
  err.meta.httpStatusCode = errCode.httpStatusCode;
  if (args) {
    err.meta.message = util.format(errCode.message, args);
  } else {
    err.meta.message = errCode.message;
  }

  return err;
};

ErrorHelper.prototype.fillErrCodes = function(errcodesName) {
  var errcodes = require('./' + errcodesName);
  for ( var key in errcodes) {
    this.codes[key] = errcodes[key];
  }
};

module.exports = (function() {
  if (!errHelper) {
    errHelper = new ErrorHelper();
  }
  return errHelper;
})();
