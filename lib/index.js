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

const mozlog = function mozlog(options) {
  if (backCompat) {
    return backCompat(options);
  }

  if (typeof options === 'string') {
    options = { app: options }
  }

  assert(options.app, 'app must be a non-empty string')
  var app = options.app;
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

  return function logger(name) {
    var nameParts = [app];
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
