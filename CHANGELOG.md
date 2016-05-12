### 2.0.4

- fix exception when Fields is undefined

### 2.0.3

- improve exception logging

### 2.0.2

- improve debug error messages, intercept uncaughtExceptions

### 2.0.1

- Added `stream` to `mozlog.config(options)`

### 2.0.0

Breaking changes:

- Buffers in a log message are hex encoded via `buf.toString('hex')`.
