var mongo = require('mongoskin');
var Promise = require('bluebird');
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
    w : 1
  });
  dbCache[instanceName] = db;
  return db;
};

initializeMasterCnn();

var DbService = function(instanceName, collectionName) {
  this.db = getDataBase(instanceName);
  this.collectionName = collectionName;
};

DbService.prototype.collection = function(collectionName) {
  return this.db.collection(collectionName);
};

DbService.prototype.currentCollection = function() {
  return this.db.collection(this.collectionName);
};

DbService.prototype.find = function(query, fields, options) {
  var cursor = this.currentCollection().find(query, fields, options);
  var toArray = Promise.promisify(cursor.toArray, cursor);
  return toArray();
};

DbService.prototype.findOne = function(query, fields, options) {
  var findOne = Promise.promisify(this.currentCollection().findOne, this.currentCollection());
  return findOne(query, fields, options);
};

DbService.prototype.insert = function(doc, options) {
  var insert = Promise.promisify(this.currentCollection().insert, this.currentCollection());
  return insert(doc, options);
};

DbService.prototype.remove = function(query, options) {
  var remove = Promise.promisify(this.currentCollection().remove, this.currentCollection());
  return remove(query, options);
};

DbService.prototype.save = function(doc, options) {
  var save = Promise.promisify(this.currentCollection().save, this.currentCollection());
  return save(doc, options);
};

DbService.prototype.update = function(query, doc, options) {
  var update = Promise.promisify(this.currentCollection().update, this.currentCollection());
  return update(query, doc, options);
};

DbService.prototype.count = function(query, options) {
  var count = Promise.promisify(this.currentCollection().count, this.currentCollection());
  return count(query, options);
};

DbService.prototype.findAndModify = function(query, sort, doc, options) {
  var findAndModify = Promise.promisify(this.currentCollection().findAndModify, this.currentCollection());
  return findAndModify(query, sort, doc, options);
};

DbService.prototype.findAndRemove = function(query, sort, options) {
  var findAndRemove = Promise.promisify(this.currentCollection().findAndRemove, this.currentCollection());
  return findAndRemove(query, sort, options);
};

module.exports = DbService;
