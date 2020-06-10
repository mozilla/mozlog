/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = require('util');

const intel = require('intel');

function PrettyFormatter(options) {
  options = options || {};
  options.format = '%(levelname)s %(name)s: %(message)s';
  options.colorize = true;
  intel.Formatter.call(this, options);
}
util.inherits(PrettyFormatter, intel.Formatter);

PrettyFormatter.prototype.format = function prettyFormat(record) {
  var name = record.args[0];
  var payload = record.args[1];
  record.args = ['%?', payload];
  record.name += '.' + name;
  if (typeof payload === 'object') {
    for (var key in payload) {
      if (payload[key] instanceof Error) {
        payload[key] = String(payload[key]);
      }
    }
  }
  return intel.Formatter.prototype.format.call(this, record);
}

module.exports = PrettyFormatter;
