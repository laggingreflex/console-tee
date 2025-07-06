# console-tee

Tee (duplicate) all console output to a file, using [console-interceptor](https://github.com/laggingreflex/console-interceptor).

## Install

```
npm i console-tee
```

## Usage

```js
require("console-tee");
```

Or run your script with:

```
node --require console-tee your-script.js
```

By default, logs are written to `output.log` in the current directory. You can customize the log file via arguments or environment variables.

### Options

- **Log file**:
  - 1st CLI argument: `node --require console-tee your-script.js mylog.txt`
  - Environment variable: `CONSOLE_TEE=mylog.txt`
- **Error log file**:
  - 2nd CLI argument: `node --require console-tee your-script.js mylog.txt myerr.txt`
  - Environment variable: `CONSOLE_TEE_ERR=myerr.txt`
- **Sync writes**:
  - By default, writes are synchronous unless you use `--no-sync` or set `CONSOLE_TEE_SYNC=false`.

### Example

```js
console.log("hello");
console.error("error!");
```

```
node --require console-tee test.js
```

This will write all console output to `output.log`.

## API

```js
// No API: just require the module to activate teeing.
require("console-tee");
```

## Related

- [console-interceptor](https://github.com/laggingreflex/console-interceptor)
- [console-source](https://github.com/laggingreflex/console-source)
