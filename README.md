# benchmark-json-reporter

Returns an array with the data for every benchmark of the suite. The default callback writes it to the `<rootFolder>/benchmarks/<suiteName>.json` file. No npm dependencies.

It works only in NodeJS.

## Installation

`yarn add benchmark benchmark-json-reporter`

Or

`npm install --save benchmark benchmark-json-reporter`

## Function firm

```ts
type jsonReportCallback = (
  result: {
    sysinfo: any;
    benchmarks: any[];
  },
  sysHash: string,
  name: string,
  folder: string,
) => void
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
    // Faster heavy process
  })
  // ...
  .add('bench-name-n', () => {
    // Slower heavy process
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
  callback(result, hashId, name, folder) {
    // 1. Connect to a database
    const connection = new SomeEndPoint();
    // 2. Store the sysinfo with the hashId as a main ID
    connection
      .getById(hashId)
      .update({ sysinfo: result.sysinfo })
      .then(() => 
        // 3. Store the benchmarks
        Promise.all(
          benchs.map(bench =>
            // For each benchmark, push the result into the collection
            connection
              .getById(hashId)
              .getProp('benchmarks')
              .getCollection(bench.timestamp).push(bench),
          )
        )
      ).then(() => {
        // 4. Close the database connection
        connection.close();
      });
    // 5. Profit.
  },
});

suite
  .add('bench-name-1', () => {
    // Faster heavy process
  })
  // ...
  .add('bench-name-n', () => {
    // Slower heavy process
  })
  // run async
  .run({ async: true });
```
