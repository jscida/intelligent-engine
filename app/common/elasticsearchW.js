var config = require('../../config');
var elasticsearch = require('elasticsearch');
var currentConfig = config.getCurrent();

var client = null;

module.exports = (function() {
  if (!client) {
    client = new elasticsearch.Client(currentConfig.elasticsearch);
  }
  return client;
})();
