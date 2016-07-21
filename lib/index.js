/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert');

const intel = require('intel');
const merge = require('merge');

const HekaFormatter = require('./formatters/heka');
const PrettyFormatter = require('./formatters/pretty');

var app;

function logger(name) {
  assert(app, 'mozlog.config({ app: "your-app" }) must be called first.');
  var nameParts = [app];
  if (name !== undefined) {
    nameParts.push(name);
  }
  return intel.getLogger(nameParts.join('.'));
}

function config(options) {
  app = options.app;
  var level = options.level != null ? options.level : intel.INFO;
  var fmt = options.fmt || 'heka';
  var debug = !!options.debug;
  assert(fmt === 'pretty' || fmt === 'heka', 'fmt must be pretty or heka');

  var conf = {
    formatters: {
      pretty: {
        class: PrettyFormatter
      },
      heka: {
        class: HekaFormatter
      }
    },
    handlers: {
      stdout: {
        class: require('./handler'),
        stream: options.stream ? options.stream : process.stdout,
        formatter: fmt,
        debug: debug
      }
    },
    loggers: {}
  };
  conf.loggers[app] = {
    handlers: ['stdout'],
    handleExceptions: true,
    level: level,
    propagate: false
  };

  if (options.config) {
    merge(conf, options.config);
  }
  intel.config(conf);
}

logger.HekaFormatter = HekaFormatter;
logger.config = config;
module.exports = logger;
