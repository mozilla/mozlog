### 2.1.1

- fix `mozlog.config` being called multiple times

## 2.1.0

- change default behavior to return `mozlog` instances instead of
  keeping a global state

  Reverts to 2.0 behavior if `mozlog.config` is called, but this
  behavior is deprecated.
- add `uncaught` option, allowed values: `'exit'`, `'log'`, `'ignore'`

### 2.0.6

- refactor `debug` and `uncaught` filters into a single `Handler
- fix `uncaught` exceptions triggering `debug` assertions

### 2.0.5

- convert `Error`s to `String`s in `pretty` format

### 2.0.4

- fix exception when Fields is undefined

### 2.0.3

- improve exception logging

### 2.0.2

- improve debug error messages, intercept uncaughtExceptions

### 2.0.1

- Added `stream` to `mozlog.config(options)`

## 2.0.0

Breaking changes:

- Buffers in a log message are hex encoded via `buf.toString('hex')`.
