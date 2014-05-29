var response = require('./response');
var errors = require('../errors');

var MAX_DOCS = 50;
var POSITIVE_INT_REGEX = /^\d+$/;
var BOOL_REGEX = /^true$/i;

var parseOffset = function(req) {
  if (req.query.$offset && POSITIVE_INT_REGEX.test(req.query.$offset)) {
    return parseInt(req.query.$offset);
  }
  return 0;
};

var parseLimit = function(req) {
  if (req.query.$limit && POSITIVE_INT_REGEX.test(req.query.$limit)) {
    return parseInt(req.query.$limit);
  }
  return MAX_DOCS;
};

var executeStdInputQuery = function(model, query, req, res, preprocessQuery) {
  var jsonResponse = {
    data: null,
    meta: {
      paging: {
        totalItems: null,
        limit: MAX_DOCS,
        offset: 0,
        pageNumber: null,
        next: null,
        previous: null
      }
    }
  };
  var doRecordCount = false;
  var paramQuery = null;
  var fields = null;
  var sortBy = null;

  jsonResponse.meta.paging.limit = parseLimit(req);
  jsonResponse.meta.paging.offset = parseOffset(req);

  if (req.query.$filter) {
    var queryStr = req.query.$filter.replace(' ', '');
    if (queryStr.match('[$]where')) {
      var err = errors.normalizeError('STD_INPUT_NOT_SUPPORTED');
      response.handleError(err, res);
      return;
    }
    try {
      paramQuery = JSON.parse(req.query.$filter);
    } catch (e) {
      var err = errors.normalizeError('STD_INPUT_INVALID_QUERY', e);
      response.handleError(err, res);
      return;
    }
  }

  if (req.query.$inlinecount && BOOL_REGEX.test(req.query.$inlinecount)) {
    doRecordCount = true;
  }

  if (req.query.$fields) {
    fields = req.query.$fields;
  }

  if (req.query.$orderby) {
    sortBy = req.query.$orderby;
  }

  if (query && paramQuery) {
    query = {
      $and: [ query, paramQuery ]
    };
  } else if (paramQuery) {
    query = paramQuery;
  }

  jsonResponse.meta.paging.pageNumber = jsonResponse.meta.paging.offset / jsonResponse.meta.paging.limit;
  var execquery = model.find(query).select(fields).skip(jsonResponse.meta.paging.offset).limit(jsonResponse.meta.paging.limit).sort(sortBy);
  if (preprocessQuery) {
    execquery = preprocessQuery(execquery);
  }
  if (doRecordCount) {
    model.count(query, function(err, count) {
      if (err) {
        err = errors.normalizeError('STD_QUERY_ERROR', err);
        response.handleError(err, res);
        return;
      }
      jsonResponse.meta.paging.totalItems = count;
      executeQuery(execquery, jsonResponse, res);
    });
  } else {
    executeQuery(execquery, jsonResponse, res);
  }
};

function executeQuery(execquery, jsonResponse, res) {
  execquery.exec(function(err, msg) {
    if (err) {
      err = errors.normalizeError('STD_QUERY_ERROR', err);
      response.handleError(err, res);
      return;
    }
    jsonResponse.data = msg;
    response.safeMethod(null, jsonResponse, res);
  });
}

exports.parseOffset = parseOffset;
exports.parseLimit = parseLimit;
exports.executeStdInputQuery = executeStdInputQuery;