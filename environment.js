var express = require('express');
var config = require('./config');
var middleware = require('./app/middleware');
var logging = require('./app/logging');
var routes = require('./app/routes');

var currentConfig = config.getCurrent();
var env = null;

var Environment = function() {
  this.app = null;
};

Environment.prototype.getCurrentConfig = function() {
  return currentConfig;
};

Environment.prototype.initializeLoggingMaster = function(processName) {
  var logconfig = config.getCurrent().logging;
  logging.initializeMaster(logconfig);
};

Environment.prototype.initializeLoggingWorker = function(workerId) {
  var logconfig = config.getCurrent().logging;
  logging.initializeWorker(workerId, logconfig.level);
};

Environment.prototype.initializeLogging = function(processName) {
  var logconfig = config.getCurrent().logging;
  logging.initialize(logconfig);
};

Environment.prototype.initialize = function(app, workerId) {
  this.app = app;
  this.initializeLoggingWorker(workerId);

  app.configure(function() {
    app.set('port', currentConfig.app.port || 8001);
    app.use(middleware.vrdhooker());
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(middleware.logger());
    app.use(middleware.authenticator(currentConfig.auth.excludedPaths));
    app.use(app.router);
  });

  routes.initialize(app);
};

Environment.prototype.terminate = function() {
  if (this.app) {
    this.app.removeAllListeners();
    this.app = null;
  }
  this.removeAllListeners();
};

module.exports = (function() {
  if (!env) {
    env = new Environment();
  }
  return env;
})();