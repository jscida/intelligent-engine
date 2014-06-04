var DbService = require('../dataproviders/db-service');
var response = require('../common/response');

var TestManager = function() {
};

TestManager.prototype.test = function(req, res) {
  var coll = req.params.col;
  var db = req.params.db;
  var service = new DbService(db);

  service.collection(coll).find({}).toArray(function(err, data) {
    response.handleResponse(err, data, res);
  });
};

module.exports = new TestManager();