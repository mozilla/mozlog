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

function methodExample(levelname) {
  return 'logger.' + levelname.toLowerCase() + '(...)';
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
    filters: {
      debug: function(record) {
        var ex = methodExample(record.levelname);
        assert(record.args.length <= 2, ex + ' takes a maximum of 2 arguments');
        assert.equal(typeof record.args[0], 'string',
            ex + ' must take a String as first argument, got: '
            + record.args[0]);
        assert.equal(record.args[0].indexOf(' '), -1,
            ex + ' first argument must not contain spaces, got "'
            + record.args[0] + '"');
        return true;
      },
      uncaught: function(record) {
        if (record.uncaughtException && record.args.length === 1) {
          record.args = ['uncaughtException', record.args[0]];
        }
        return true;
      }
    },
    handlers: {
      stdout: {
        class: intel.handlers.Stream,
        stream: options.stream ? options.stream : process.stdout,
        formatter: fmt
      }
    },
    loggers: {}
  };
  conf.loggers[app] = {
    handlers: ['stdout'],
    handleExceptions: true,
    level: level,
    propagate: false,
    filters: debug ? ['uncaught', 'debug'] : ['uncaught']
  };

  if (options.config) {
    merge(conf, options.config);
  }
  intel.config(conf);
}

logger.HekaFormatter = HekaFormatter;
logger.config = config;
module.exports = logger;
