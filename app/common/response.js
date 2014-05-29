var util = require('util');

var handleResponse = function(err, recordSet, res) {
  if (!err) {
    res.status(200).json(recordSet);
  } else {
    handleError(err, res);
  }
};

var handleSuccessResponse = function(statusCode, data, res) {
  res.status(statusCode).json(data);
};

var handleError = function(err, res) {
  var payload = {
    error: null,
    meta: {
      code: null,
      requestId: null
    }
  };
  var statusCode;

  if (util.isError(err) && err.meta) {
    payload.error = err.meta.message;
    statusCode = err.meta.httpStatusCode;
    payload.meta.code = err.meta.code;
    payload.meta.errors = err.meta.errors;
  } else {
    payload.error = err;
    statusCode = 451;
  }

  if (err.formatError) {
    res.logger.error(err.formatError());
  } else {
    res.logger.error(err.toString());
  }

  payload.meta.requestId = res.id;
  res.status(statusCode).json(payload);
};

exports.handleSuccessResponse = handleSuccessResponse;
exports.handleError = handleError;
exports.handleResponse = handleResponse;
exports.safeMethod = handleResponse;
exports.unsafeMethod = handleResponse;