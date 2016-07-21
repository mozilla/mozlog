const assert = require('assert');
const util = require('util');

const Stream = require('intel').handlers.Stream;
const superEmit = Stream.prototype.emit;

function debugAssert(record) {
  var ex = 'logger.' + record.levelname.toLowerCase() + '(...)';
  assert(record.args.length <= 2, ex + ' takes a maximum of 2 arguments');
  assert.equal(typeof record.args[0], 'string',
      ex + ' must take a String as first argument, got: '
      + record.args[0]);
  assert.equal(record.args[0].indexOf(' '), -1,
      ex + ' first argument must not contain spaces, got "'
      + record.args[0] + '"');
}

function noAssert() {}

function Handler(options) {
  Stream.call(this, options);

  this.checkRecord = options.debug ? debugAssert : noAssert;
}

util.inherits(Handler, Stream);


Handler.prototype.emit = function handlerEmit(record) {
  if (record.uncaughtException && record.args.length === 1) {
    record.args = ['uncaughtException', record.args[0]];
  }

  this.checkRecord(record);

  superEmit.call(this, record);
};

module.exports = Handler;
