/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('assert');
const util = require('util');

const intel = require('intel');
const merge = require('merge');

const HekaFormatter = require('./formatters/heka');
const PrettyFormatter = require('./formatters/pretty');

let backCompat;

function mozlog(options) {
  if (backCompat) {
    return backCompat(options);
  }

  if (typeof options === 'string') {
    options = { app: options }
  }

  const app = options.app;
  const level = options.level != null ? options.level : intel.INFO;
  const fmt = options.fmt || 'heka';
  const debug = !!options.debug;
  // TODO: update default to 'exit', current 'log' is to not change
  // behavior. update when going to 3.0
  const uncaught = options.uncaught || 'log';

  assert(app, 'app must be a non-empty string')
  assert(fmt === 'pretty' || fmt === 'heka', 'fmt must be pretty or heka');
  assert(uncaught === 'exit' || uncaught === 'log' || uncaught === 'ignore',
    'uncaught must be either `exit`, `log`, or `ignore`');

  const handleExceptions = uncaught === 'exit' || uncaught === 'log';
  const exitOnError = uncaught === 'exit';

  const conf = {
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
    handleExceptions: handleExceptions,
    exitOnError: exitOnError,
    level: level,
    propagate: false
  };

  if (options.config) {
    merge(conf, options.config);
  }
  intel.config(conf);

  return function logger(name) {
    const nameParts = [app];
    if (name !== undefined) {
      nameParts.push(name);
    }
    return intel.getLogger(nameParts.join('.'));
  }
}

mozlog.HekaFormatter = HekaFormatter;

mozlog.config = util.deprecate(function config(opts) {
  backCompat = mozlog(opts);
}, 'mozlog.config() is deprecated. Use mozlog(opts) to receive a specific mozlog instance.')

module.exports = mozlog;
