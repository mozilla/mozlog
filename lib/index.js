/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert');

const intel = require('intel');
const merge = require('merge');

const HekaFormatter = require('./format');

var app;

function logger(name) {
  assert(app, 'mozlog.config({ app: "your-app" }) must be called first.');
  return intel.getLogger([app, name].join('.'));
}

function config(options) {
  app = options.app;
  var level = options.level != null ? options.level : intel.INFO;
  var fmt = options.fmt || 'heka';
  assert(fmt === 'pretty' || fmt === 'heka', 'fmt must be pretty or heka');

  var conf = {
    formatters: {
      pretty: {
        format: '%(name)s.%(levelname)s: %(message)s',
        colorize: true
      },
      heka: {
        class: HekaFormatter
      }
    },
    handlers: {
      stdout: {
        class: intel.handlers.Stream,
        stream: process.stdout,
        formatter: fmt
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
