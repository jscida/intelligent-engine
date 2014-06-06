var DbService = require('../dataproviders/db-service');
var response = require('../common/response');

var TestManager = function() {
};

TestManager.prototype.test = function(req, res) {
  var coll = req.params.col;
  var db = req.params.db;
  var service = new DbService(db, coll);
  
  service.findOne({"name": "adsdas"}).then(function(data){
    response.handleResponse(null, data, res);
  });
  
};

module.exports = new TestManager();