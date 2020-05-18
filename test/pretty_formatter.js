/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('assert');
const stripAnsi = require('strip-ansi');

const NAMESPACE = 'mozlog_pretty'

const mozlog = require('../');

var lastLog;
var writer = {
  write: function(str) {
    lastLog = stripAnsi(str);
    return true;
  }
};

const fxaLog = mozlog({
  app: NAMESPACE,
  fmt: 'pretty',
  stream: writer,
});

var logger = fxaLog('test.pretty');

/*global describe,it,beforeEach,afterEach*/

describe('pretty formatter', function() {
  it('should serialize objects to JSON strings', function() {
    var obj = { foo: { bar: 'baz' }, quux: 'baz' };
    logger.info('json', obj);
    assert.equal(lastLog, 'mozlog_pretty.test.pretty.INFO: json {"foo":{"bar":"baz"},"quux":"baz"}\n');
  });

  it('should serialize circular objects', function() {
    var obj = { foo: {} };
    obj.foo.bar = obj;
    logger.info('jsoncircles', obj);
    assert.equal(lastLog, 'mozlog_pretty.test.pretty.INFO: jsoncircles {"foo":{"bar":"[Circular]"}}\n');
  });

  it('should serialize errors', function() {
    var err1 = new Error('foo');
    logger.error('errors', err1);
    assert(lastLog.startsWith('mozlog_pretty.test.pretty.ERROR: errors Error: foo'));
  });

  it('should serialize nested errors', function() {
    var err1 = new Error('foo');
    logger.error('errors', { obj: err1 });
    assert.equal(lastLog, 'mozlog_pretty.test.pretty.ERROR: errors {"obj":"Error: foo"}\n');
  });

  it('should coerce messages to strings', function() {
    var out = logger.warn('message', 42);
    assert.equal(lastLog, 'mozlog_pretty.test.pretty.WARN: message 42\n');
  });
});
