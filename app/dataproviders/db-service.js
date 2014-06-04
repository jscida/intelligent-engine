var mongo = require('mongoskin');
var config = require('../../config');

var servers = config.getCurrent().db.hosts;
var masterDbName = config.getCurrent().db.name;
var ReplSetServers = mongo.ReplSetServers;
var Server = mongo.Server;
var Db = mongo.Db;

var dbCache = {};

function createReplSet() {
  var serverArray = [];
  for ( var i = 0; i < servers.length; i++) {
    var splitted = servers[i].split(':');
    var svr = new Server(splitted[0], splitted[1]);
    serverArray.push(svr);
  }
  return new ReplSetServers(serverArray);
};

function initializeMasterCnn() {
  if (dbCache['master']) {
    return;
  }
  var replSet = createReplSet();
  var masterDb = new Db(masterDbName, replSet, {
    w : 0
  });
  dbCache['master'] = masterDb;
};

function getDataBase(instanceName) {
  if (dbCache[instanceName]) {
    return dbCache[instanceName];
  }
  var replSet = createReplSet();
  var db = new Db(instanceName, replSet, {
    w : 0
  });
  dbCache[instanceName] = db;
  return db;
};

initializeMasterCnn();

var DbService = function(instanceName) {
  this.db = getDataBase(instanceName);
};

DbService.prototype.collection = function(collectionName) {
  return this.db.collection(collectionName);
};

module.exports = DbService;
