var env = require('./environment');
var config = require('./config');
var express = require('express');
var http = require('http');
var logging = require('./app/logging');
var cluster = require('cluster');

if (cluster.isMaster) {
  var numCPUs = require('os').cpus().length;
  if (numCPUs > 1) {
    numCPUs = numCPUs - 1;
  }
  env.initializeLoggingMaster();

  var logger = logging.createLogger();
  logger.info('CPUs:' + numCPUs);
  for ( var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('fork', function(worker, code, signal) {
    logger.info('worker ' + worker.id + ' forked');
  });
  cluster.on('exit', function(worker, code, signal) {
    logger.info('worker ' + worker.id + ' died');
  });

} else {
  var workerId = cluster.worker.id;
  var app = express();

  env.initialize(app, workerId);
  var logger = logging.createLogger();

  cluster.on('exit', function(worker, code, signal) {
    env.terminate();
  });

  var port = app.get('port');
  
  http.createServer(app).listen(port, function() {
    logger.info('Express server running ' + config.getEnv() + ' environment and listening on port ' + app.get('port') + ' on worker: ' + workerId);
  });
}
