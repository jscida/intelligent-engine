var testManager = require('../objectmodel/test');


module.exports.initialize = function(app) {
  app.get('/test/:db/:col', testManager.test);
};