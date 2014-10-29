# mozlog

[![NPM version](https://badge.fury.io/js/mozlog.svg)](http://badge.fury.io/js/mozlog)
[![Build Status](https://travis-ci.org/mozilla/mozlog.svg?branch=master)](https://travis-ci.org/mozilla/mozlog)

A logger that outputs JSON that adheres to Heka's expected schema.

```
npm install --save mozlog
```

## Usage

You must configure `mozlog` one time before using it's loggers. This is
essentially setting the `app` name, the `level`, and the `fmt`.

For the brave (or those who know `intel`'s configuration options), you
can pass a `config` property to have fine-grained control.

```js
// once, such as at app startup
require('mozlog').config({
  app: 'fxa-oauth-server',
  level: 'verbose', //default is INFO
  fmt: 'pretty', //default is 'heka'
  debug: true, //default is false
});
```

You may want the level set down to `verbose` or `debug` when developing.
Likewise, you may want the line to be readable by humans when
developing, so the `pretty` formatter will help.

In production, the defaults will serve you well: `info` and `heka`.

```js
// elsewhere
var log = require('mozlog')('routes.client.register');

log.info(op, { some: details });
// such as
log.debug('newClient', { id: client.id, name: client.name });
```

First parameter is a string "op". It should be unique within the file.
Second parameter is some optional object, with keys and values that
would make sense when looking at the logs again.

The `debug` option (not level) in the config will add in some asserts
that your usage adheres to the above: that there's only ever at most 2
arguments to a log function, the first is a string without spaces.
