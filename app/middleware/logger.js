var logging = require('../logging');
var log4js = require('log4js');
var LOG_FORMAT = ':request-id - :remote-addr - :method :url - status::status - :res[content-length] Kb - response time :response-time ms';

module.exports.logger = function() {
  return log4js.connectLogger(logging.getLog4jsLogger(), {level: 'auto', format: format });
};

var format = function(req, res, msg) {
  var line = msg(LOG_FORMAT);
  line = line.replace(':request-id', req.id);
  return line;
};
