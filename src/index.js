/* eslint-disable strict */

'use strict';

const fs = require('fs');

const defaultConfig = {
  folder: 'benchmarks',
  callback(result, name, folder) {
    const absFolder = `${process.cwd()}/${folder}`;

    if (!fs.existsSync(absFolder)) {
      fs.mkdirSync(absFolder);
    }

    fs.appendFileSync(
      `${absFolder}/${name}.json`,
      `${JSON.stringify(result)}\n`,
    );
  },
};

/**
 * This callback process the benchmark results.
 *
 * @callback jsonReportCallback
 * @param {Array<Object>} result
 * @param {string} name
 * @param {string} folder
 * @returns {void}
 */
/**
 * Generates an array of objects with the data of every benchmark.
 * By default it writes it to a local json file.
 *
 * @param {Benchmark.Suite} suite The suite to be processed.
 * @param {Object} [config] The reporter configuration.
 * @param {string} [config.folder='benchmarks'] The folder to save the files.
 * @param {jsonReportCallback} [config.callback] The function that process the data.
 * @returns {void}
 */
module.exports = function jsonReporter(suite, config = defaultConfig) {
  const benchmarks = [];

  suite.on('cycle', evt => {
    benchmarks.push(evt.target);
  });
  suite.on('complete', () => {
    const result = benchmarks.map(bench => {
      if (bench.error) {
        return {
          name: bench.name,
          id: bench.id,
          error: bench.error,
        };
      }

      return {
        name: bench.name,
        id: bench.id,
        stats: bench.stats,
        samples: bench.stats.sample.length,
        deviation: bench.stats.rme.toFixed(2),
        ops: bench.hz.toFixed(bench.hz < 100 ? 2 : 0),
      };
    });

    config.callback(result, suite.name, config.folder);
  });
};
