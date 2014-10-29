/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = require('util');

const intel = require('intel');

const ENV_VERSION = "2.0";

const SYSLOG_LEVELS = {};

SYSLOG_LEVELS[intel.TRACE] = 7;
SYSLOG_LEVELS[intel.VERBOSE] = 7;
SYSLOG_LEVELS[intel.DEBUG] = 7;
SYSLOG_LEVELS[intel.INFO] = 6;
SYSLOG_LEVELS[intel.WARN] = 4;
SYSLOG_LEVELS[intel.ERROR] = 2;
SYSLOG_LEVELS[intel.CRITICAL] = 0;

function json(obj) {
  var seen = [];
  return JSON.stringify(obj, function filter(key, val) {
    if (seen.indexOf(val) !== -1) {
      return '[Circular]';
    }
    seen.push(val);
    return val;
  }, 0);
}

function serialize(val) {
  var t = typeof val;
  if (t === 'number' || t === 'string' || t === 'boolean') {
    // val is fine
  } else if (Buffer.isBuffer(val)) {
    val = val.toString('hex');
  } else {
    val = json(val);
  }
  return val;
}

function HekaFormatter(options) {
  options = options || {};
  options.format = '%O';
  options.colorize = false;
  intel.Formatter.call(this, options);
}
util.inherits(HekaFormatter, intel.Formatter);

HekaFormatter.prototype.format = function hekaFormat(record) {
  var nameParts = record.name.split('.');
  var logger = nameParts.shift();
  var args = record.args;
  nameParts.push(args[0]);



  var rec = {
    Timestamp: record.timestamp * 1000000,
    Logger: logger,
    Type: nameParts.join('.'),
    Hostname: record.hostname,
    Severity: SYSLOG_LEVELS[record.level],
    Pid: record.pid,
    EnvVersion: ENV_VERSION,
  };

  var payload = args[1];
  var fields = {};
  if (typeof payload === 'object') {
    for (var key in payload) {
      fields[key] = serialize(payload[key]);
    }
    rec.Fields = fields;
  } else if (payload) {
    fields.msg = payload;
    rec.Fields = fields;
  }

  return intel.Formatter.prototype.format.call(this, rec);
};

module.exports = HekaFormatter;
