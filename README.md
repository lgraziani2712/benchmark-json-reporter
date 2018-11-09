# benchmark-json-reporter

Returns an array with the data for every benchmark of the suite. The default callback writes it to the `<rootFolder>/benchmarks/<suiteName>.json` file.

It works only in NodeJS.

## Installation

`yarn add benchmark benchmark-json-reporter`

Or

`npm install --save benchmark benchmark-json-reporter`

## Function firm

```ts
type jsonReportCallback = (result: Object[], name: string, folder: string) => void
type jsonReporter = (
  suite: Benchmark.Suite,
  config?: {
    folder?: string,
    callback?: jsonReportCallback,
  },
) => void
```

## Usage

### Using the default callback

```js
const Benchmark = require('benchmark');
const jsonReporter = require('benchmark-json-reporter');

const suite = new Benchmark.Suite('my-bench-suite');

// Just this
jsonReporter(suite);

suite
  .add('bench-name-1', () => {
    // Heavy code
  })
  // ...
  .add('bench-name-n', () => {
    // Heavy code
  })
  // run async
  .run({ async: true });
```

### Using a custom callback

```js
const Benchmark = require('benchmark');
const jsonReporter = require('benchmark-json-reporter');

const suite = new Benchmark.Suite('my-bench-suite');

// Just this
jsonReporter(suite, {
  callback(result, name, folder) {
    // 1. Connect to a database
    const connection = new SomeEndPoint();
    // 2. Store the result
    Promise.all(
      benchs.map(bench =>
        // For each benchmark, push the result to the collection
        connection.getCollection(bench.name).push(bench),
      ),
    ).then(() => {
      // 3. Close the database connection
      connection.close();
    });
    // 4. Profit.
  },
});

suite
  .add('bench-name-1', () => {
    // Heavy code
  })
  // ...
  .add('bench-name-n', () => {
    // Heavy code
  })
  // run async
  .run({ async: true });
```
