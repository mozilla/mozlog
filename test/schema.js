/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist');
const tv4 = require('tv4');
const intel = require('intel');
const HEKA_SCHEMA = require('./schema.json');
const NAMESPACE = 'mozlog'

const mozlog = require('../');

const fxaLog = mozlog({
  app: NAMESPACE
});

var lastStr;
var writer = {
  write: function(str) {
    lastStr = str;
    return true;
  }
};

var logger = fxaLog('test.schema');
logger.propagate = false;
var handler = new intel.handlers.Stream({
  stream: writer,
  formatter: new mozlog.HekaFormatter()
});
logger.addHandler(handler);

function log() {
  logger.info.apply(logger, arguments);
  return JSON.parse(lastStr);
}

/*global describe,it,beforeEach,afterEach*/

describe('schema', function() {
  it('should use first arg + logger name for Type', function() {
    var out = log('foo');
    assert(tv4.validate(out, HEKA_SCHEMA));
    assert.equal(out.Type, 'test.schema.foo');
  });

  describe('with empty namespace', function() {
    var oldLogger;

    beforeEach(function() {
      oldLogger = logger;
    });

    afterEach(function() {
      logger = oldLogger;
    });

    it('should drop first arg if empty', function() {
      // Create a new logger with an empty namespace.
      logger = fxaLog();
      assert.equal(logger._name, NAMESPACE);
    });
  });

  it('should map to syslog severity', function() {
    var out = log('foo');
    assert(tv4.validate(out, HEKA_SCHEMA));
    assert.equal(out.Severity, 6);
  });

  it('should serialize buffers to hex', function() {
    var out = log('buffers', { buf: Buffer('c0ffee', 'hex') });
    assert(tv4.validate(out, HEKA_SCHEMA));
    assert.equal(out.Fields.buf, 'c0ffee');
  });

  it('should serialize objects to JSON strings', function() {
    var obj = { foo: { bar: 'baz' }, quux: 'baz' };
    var out = log('json', { obj: obj });

    assert(tv4.validate(out, HEKA_SCHEMA));
    assert.equal(out.Fields.obj, '{"foo":{"bar":"baz"},"quux":"baz"}');
  });

  it('should serialize buffers nested in objects', function() {
    var obj = { food: Buffer('c0ffee', 'hex'), bar: 3 };
    var out = log('jsonbuffers', { obj: obj });

    assert(tv4.validate(out, HEKA_SCHEMA));
    assert.equal(out.Fields.obj, '{"food":"c0ffee","bar":3}');
  });

  it('should serialize circular objects', function() {
    var obj = { foo: {} };
    obj.foo.bar = obj;
    var out = log('jsoncircles', { obj: obj });
    assert(tv4.validate(out, HEKA_SCHEMA));
    assert.equal(out.Fields.obj, '{"foo":{"bar":"[Circular]"}}');
  });

  it('should serialize errors', function() {
    var err1 = new Error('foo');
    var out = log('errors', err1);
    assert(tv4.validate(out, HEKA_SCHEMA));
    assert.equal(out.Fields.error, 'Error: foo');
  });

  it('should coerce messages to strings', function() {
    var out = log('message', 42);
    assert(tv4.validate(out, HEKA_SCHEMA));
    assert.strictEqual(out.Fields.msg, '42');
  });
});

describe('multiple instances', () => {
  it('can create different instances', () => {
    const one = mozlog('one');
    const two = mozlog('two');

    assert.equal(one('a')._name, 'one.a');
    assert.equal(two('b')._name, 'two.b');
  });

  it('has deprecated .config()', () => {
    mozlog.config('depr');
    const log = mozlog('hello');
    assert.equal(log._name, 'depr.hello');

    mozlog.config('depr2');
    const log2 = mozlog('hi');
    assert.equal(log2._name, 'depr2.hi');
  });
});
